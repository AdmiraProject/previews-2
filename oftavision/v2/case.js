/* v2 use-case pages: process timeline accordion */
document.querySelectorAll('.tl__i button').forEach(function (b) {
  b.addEventListener('click', function () { var li = b.parentElement, o = li.classList.toggle('open'); b.setAttribute('aria-expanded', o); });
});
