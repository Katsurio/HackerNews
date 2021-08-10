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
        <span class="star">
          <i class="far fa-star"></i>
        </span>
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

// function putStoriesOnPage() {
//   console.debug('putStoriesOnPage')

//   $allStoriesList.empty()

//   // loop through all of our stories and generate HTML for them
//   for (let story of storyList.stories) {
//     const $story = generateStoryMarkup(story)
//     $allStoriesList.append($story)
//   }

//   $allStoriesList.show()
// }

function putStoriesOnPage() {
  console.debug('putStoriesOnPage')
  let favStories = favStoriesList()
  $allStoriesList.empty()

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    // Check if story is in favStories to show fav story icon
    const $story =
      $.inArray(story, favStories) === -1
        ? generateStoryMarkup(story)
        : generateFavStoryMarkup(story)
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
async function toggleFavoriteStories(evt) {
  // debugger
  evt.preventDefault
  const clickedEleTagName = evt.target.tagName
  if (clickedEleTagName !== 'I') return

  const liStoryId = evt.target.parentElement.parentElement.id
  // Check and update fa-icon class, then return POST or DELETE
  const postOrDelete = checkFontIconClass(evt.target)
  // If not favorited, POST/save; else, DELETE
  const result = await User.toggleUserFavStory(
    postOrDelete,
    currentUser.username,
    liStoryId,
    currentUser.loginToken,
  )
}

/** Check and update fa-icon class, then return POST or DELETE.
 */
function checkFontIconClass(element) {
  if (!element.classList.contains('fas')) {
    element.classList.remove('far')
    element.classList.add('fas')
    return 'POST'
  } else {
    element.classList.remove('fas')
    element.classList.add('far')
    return 'DELETE'
  }
}

/** Sync current user's favortie stories to localStorage.
 *
 * We store the favorite stories in localStorage so when the page is refreshed
 * (or the user revisits the site later), they will still see them.
 */

function saveFavStoryInLocalStorage(fav) {
  console.debug('saveFavStoryInLocalStorage')
  if (currentUser) {
    localStorage.setItem('favorites', fav)
  }
}

const story = document
  .getElementById('all-stories-list')
  .addEventListener('click', toggleFavoriteStories)

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

// Get list of favorite stories from filtering storyList and favorites
let favStoriesList = () =>
  storyList.stories.filter((story1) =>
    currentUser.favorites.some((story2) => story1.storyId === story2.storyId),
  )

function generateFavStoryMarkup(story) {
  console.debug('generateFavStoryMarkup', story)

  const hostName = story.getHostName()
  return $(`
      <li id="${story.storyId}">
        <span class="star">
          <i class="fas fa-star"></i>
        </span>
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

function putFavStoriesOnPage() {
  console.debug('putFavStoriesOnPage')
  let favStories = favStoriesList()
  $allStoriesList.empty()

  // loop through all of our stories and generate HTML for them
  for (let story of favStories) {
    const $story = generateFavStoryMarkup(story)
    $allStoriesList.append($story)
  }

  $allStoriesList.show()
}
