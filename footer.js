(function () {
  var footer = document.querySelector('footer');
  if (!footer) return;
  footer.innerHTML =
    '<span>2026 © ML Howell V2.1</span>' +
    '<div class="footer-links">' +
      '<a href="mailto:marylouisehowell@gmail.com">Email</a>' +
      '<a href="https://www.linkedin.com/in/marylouisehowell/" target="_blank">LinkedIn</a>' +
      '<a href="https://twitter.com/marlouiise" target="_blank">X</a>' +
      '<a href="https://github.com/mlouhowell" target="_blank">GitHub</a>' +
      '<a href="/ML Howell Resume.pdf" target="_blank">Resume</a>' +
    '</div>' +
    '<span style="width:100%;font-size:10px;">This site was designed and built by me with a little help from Claude</span>';
})();
