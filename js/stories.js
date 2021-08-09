'use strict'

// This is the global list of the stories, an instance of StoryList
let storyList

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories()
  $storiesLoadingMsg.remove()

  putStoriesOnPage()
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName()
  return $(`
      <li id="${story.storyId}">
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `)
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug('putStoriesOnPage')

  $allStoriesList.empty()

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story)
    $allStoriesList.append($story)
  }

  $allStoriesList.show()
}

async function submitStoryForm(evt) {
  console.debug('submitStoryForm')
  evt.preventDefault()

  // grab the title and url

  const title = document.getElementById('add-story-title').value
  const author = document.getElementById('add-story-author').value
  const url = document.getElementById('add-story-url').value
  const username = currentUser.username

  const newStory = await storyList.addStory(currentUser, {
    title,
    author,
    url,
    username,
  })

  const $newStory = generateStoryMarkup(newStory)

  $allStoriesList.prepend($newStory)

  addStoryForm.classList.add('hidden')
  addStoryForm.reset()
}
addStoryForm.addEventListener('submit', submitStoryForm)

/******************************************************************************
 * Favoriting stories for logged in users
 */

/** When a user clicks a favorite button on a story, it either saves or removes the story:
 *
 * - saves the story to a list of favorite stories
 * - saves the list of favorite stories to local storage for page refreshes
 * - allows logged in users to see a separate list of favorited stories
 * - shows a nav link to their favorited stories
 */
async function addStoryToFavorites(evt) {
  evt.preventDefault
  const favStoryId = evt.target.id
  const token = currentUser.loginToken
  const result = await User.addUserFavStory(
    currentUser.username,
    favStoryId,
    token,
  )

  // grab id of target
  // push id to favorites array of ids
  // make call to get all the story data for the ids' stories
  // post stories on page

  // let favoriteStories = [] // push to the favorite stories on the currentUser objecy
  // const favorite = evt.target
  // get the story object and add it to the favoriteStories
}
const storyToFavorite = document.getElementById('all-stories-list')
// storyToFavorite.addEventListener('click', addStoryToFavorites)

/** When a user clicks a favorite button on a story, it either saves or removes the story:
 *
 * - saves the story to a list of favorite stories
 * - saves the list of favorite stories to local storage for page refreshes
 * - allows logged in users to see a separate list of favorited stories
 * - shows a nav link to their favorited stories
 */
async function removeStoryFromFavorites(evt) {
  evt.preventDefault
  const favStoryId = evt.target.id
  const token = currentUser.loginToken
  const result = await User.removeUserFavStory(
    currentUser.username,
    favStoryId,
    token,
  )
  console.log(result)
  console.log(currentUser.favorites)
}
storyToFavorite.addEventListener('click', removeStoryFromFavorites)
// TODO: THESE 2 SHOULD BE CHANGED TO A TOGGLE FUNCTION WITH AN IF STATEMENT

/** Sync current user's favortie stories to localStorage.
 *
 * We store the favorite stories in localStorage so when the page is refreshed
 * (or the user revisits the site later), they will still see them.
 */

// function saveFavStoriesInLocalStorage() {
//   console.debug('saveFavStoriesInLocalStorage')
//   if (currentUser) {
//     localStorage.setItem('favorites', currentUser.user.favorites)
//   }
// }
