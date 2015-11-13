/**
 * Created by Joyce Cam on 30/12/2014.
 * Edited by Melvin Valster to temp-fix the ellipsis problem.
 * 
 * Simple and easy-to-implement angular read more directive.
 *
 */

var readMore = angular.module('readMore', []);

readMore.directive('readMore', function () {
    return {
        restrict: 'A',
        transclude: true,
        replace: true,
        template: '<p></p>',
        scope: {
            moreText: '@',
            lessText: '@',
            words: '@',
            ellipsis: '@',
            char: '@',
            limit: '@',
            content: '@',
            moreCallback: '&',
            lessCallback: '&'
        },
        link: function (scope, elem, attr, ctrl, transclude) {
            var moreText = angular.isUndefined(scope.moreText) ? ' <a class="read-more">Read More...</a>' : ' <a class="read-more">' + scope.moreText + '</a>',
                lessText = angular.isUndefined(scope.lessText) ? ' <a class="read-less">Less ^</a>' : ' <a class="read-less">' + scope.lessText + '</a>',
                ellipsis = angular.isUndefined(scope.ellipsis) ? '' : '<span class="ellipsis">' + scope.ellipsis + '</span>',
                limit = angular.isUndefined(scope.limit) ? 150 : scope.limit;

            attr.$observe('content', function (str) {
                readmore(str);
            });

            transclude(scope.$parent, function (clone, scope) {
                readmore(clone.text().trim());
            });

            function splitIntoWords(div) {
              function removeEmptyStrings(k) {
                return k !== '';
              }
              var rWordBoundary = /[\s\n\t]+/; // Includes space, newline, tab
              var output = [];
              for (var i = 0; i < div.childNodes.length; ++i) { // Iterate through all nodes
                var node = div.childNodes[i];
                if (node.nodeType === Node.TEXT_NODE) { // The child is a text node
                  var words = node.nodeValue.split(rWordBoundary).filter(removeEmptyStrings);
                  if (words.length) {
                    output.push.apply(output, words);
                  }
                } else if (node.nodeType === Node.COMMENT_NODE) {
                  // What to do here? You can do what you want
                } else {
                  output.push(node.outerHTML);
                }
              }
              return output;
            }

            function readmore(text) {

                var text = text,
                    orig = text,
                    regex = /\s+/gi,
                    charCount = text.length,
                    wordCount = text.trim().replace(regex, ' ').split(' ').length,
                    countBy = 'char',
                    count = charCount,
                    foundWords = [],
                    markup = text,
                    more = '';

                if (!angular.isUndefined(attr.words)) {
                    countBy = 'words';
                    count = wordCount;
                }

                if (countBy === 'words') { // Count words

                    //http://stackoverflow.com/a/26833172/1327637
                    var span = document.createElement('span')
                    span.innerHTML = text;
                    foundWords = splitIntoWords(span);

                    if (foundWords.length > limit) {
                        text = foundWords.slice(0, limit).join(' ') + ellipsis;
                        more = foundWords.slice(limit, count).join(' ');
                        markup = text + moreText + '<span class="more-text">' + more + lessText + '</span>';
                    }

                } else { // Count characters

                    if (count > limit) {
                        text = orig.slice(0, limit) + ellipsis;
                        more = orig.slice(limit, count);
                        markup = text + moreText + '<span class="more-text">' + more + lessText + '</span>';
                    }

                }

                elem.append(markup);
                elem.find('.read-more').on('click', function () {
                    $(this).hide();
                    elem.find('.ellipsis').hide();
                    elem.find('.more-text').addClass('show').slideDown();
                    if(scope.moreCallback) {
                        scope.moreCallback();
                    }
                });
                elem.find('.read-less').on('click', function () {
                    elem.find('.read-more').show();
                    elem.find('.ellipsis').show();
                    elem.find('.more-text').hide().removeClass('show');
                    if(scope.lessCallback) {
                        scope.lessCallback();
                    }
                });

            }
        }
    };
});
