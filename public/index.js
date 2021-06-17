const removeActiveLinks = (elems) => {
  for (let i = 0; i < elems.length; i++) {
    elems[i].classList.remove('active-nav-link');
  }
};

const handleScroll = () => {
  const aboutPosition = document.getElementById('about').getBoundingClientRect().top;
  const syllabusPosition = document.getElementById('syllabus').getBoundingClientRect().top;
  const instructorsPosition = document.getElementById('instructors').getBoundingClientRect().top;
  const reviewsPosition = document.getElementById('reviews').getBoundingClientRect().top;

  const aboutLink = document.querySelector('.nav-link-about');
  const syllabusLink = document.querySelector('.nav-link-syllabus');
  const instructorsLink = document.querySelector('.nav-link-instructors');
  const reviewsLink = document.querySelector('.nav-link-reviews');
  const allLinks = [aboutLink, syllabusLink, instructorsLink, reviewsLink];
  if (aboutPosition <= 15) {
    document.querySelector('.nav-container').classList.add('pinned-nav');
  } else {
    document.querySelector('.nav-container').classList.remove('pinned-nav');
  }

  if (aboutPosition <= 110) {
    removeActiveLinks(allLinks);
    aboutLink.classList.add('active-nav-link');
  }
  if (instructorsPosition <= 110) {
    removeActiveLinks(allLinks);
    instructorsLink.classList.add('active-nav-link');
  }
  if (syllabusPosition <= 110) {
    removeActiveLinks(allLinks);
    syllabusLink.classList.add('active-nav-link');
  }
  if (reviewsPosition <= 110) {
    removeActiveLinks(allLinks);
    reviewsLink.classList.add('active-nav-link');
  }
  if (aboutPosition > 200) {
    removeActiveLinks(allLinks);
  }
};

window.onscroll = () => handleScroll();
