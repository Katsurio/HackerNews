'use strict'

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug('navAllStories', evt)
  hidePageComponents()
  putStoriesOnPage()
  addStoryForm.classList.add('hidden')
}

$body.on('click', '#nav-all', navAllStories)

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug('navLoginClick', evt)
  hidePageComponents()
  $loginForm.show()
  $signupForm.show()
}

$navLogin.on('click', navLoginClick)

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug('updateNavOnLogin')
  $('.main-nav-links').show()
  $navLogin.hide()
  $navLogOut.show()
  $loginForm.hide()
  $signupForm.hide()
  $navUserProfile.text(`${currentUser.username}`).show()
  navSubmitStory.classList.remove('hidden')
  addStoryForm.classList.add('hidden')
  navFavorites.classList.remove('hidden')
}

/** Show add story form on click "submit". */
function navSubmitClick(evt) {
  console.debug('navSubmitClick')
  hidePageComponents()
  $allStoriesList.show()
  const addStoryForm = document.getElementById('add-story-form')
  addStoryForm.classList.remove('hidden')
}
navSubmitStory.addEventListener('click', navSubmitClick)

/** Show favorites stories on click on favorites. */
function navFavoritesClick(evt) {
  console.debug('navSubmitFavoritesClick')
  hidePageComponents()
  putFavStoriesOnPage()
}
navFavorites.addEventListener('click', navFavoritesClick)
