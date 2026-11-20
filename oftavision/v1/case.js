/* v1 use-case pages: FAQ accordion */
(function () {
  document.querySelectorAll('.faq__i button').forEach(function (b) {
    b.addEventListener('click', function () { var li = b.parentElement, o = li.classList.toggle('open'); b.setAttribute('aria-expanded', o); });
  });
  var first = document.querySelector('.faq__i'); if (first) { first.classList.add('open'); first.querySelector('button').setAttribute('aria-expanded', 'true'); }
})();
