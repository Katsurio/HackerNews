'use strict'

// This is the global list of the stories, an instance of StoryList
let storyList
let updateFavStoryList
let updatedOwnStoryList
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

function putStoriesOnPageAfterLogin() {
  console.debug('putStoriesOnPage')
  let favStories = getFavStoriesList(
    storyList.stories,
    !updateFavStoryList ? currentUser.favorites : updateFavStoryList,
  )
  $allStoriesList.empty()

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    // Check if story is in favStories to show fav story icon highlighted
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

  // Assign updatedOwnStoryList to currentUser.ownStories to push the new story
  // so that the updatedOwnStoryList will show the new story after we push it onto the array;
  // otherwise, new stories won't show on "My Stories" nav click until the page reload
  updatedOwnStoryList = currentUser.ownStories
  updatedOwnStoryList.push(newStory)

  addStoryForm.classList.add('hidden')
  addStoryForm.reset()
}

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
  evt.preventDefault
  const targetTagName = evt.target.tagName
  const targetHasClassFaStar = evt.target.classList.contains('fa-star')

  // Check if not icon or doesn't have fa-star class
  if (targetTagName !== 'I' || !targetHasClassFaStar) return

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

  let { favorites } = result

  updateFavStoryList = faves(favorites)
}

// turn favorites list into array of stories
let faves = (favList) => favList.map((fav) => new Story(fav))

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

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

// Get list of favorite stories from filtering storyList and favorites
let getFavStoriesList = (storyArr1, storyArr2) =>
  storyArr1.filter((story1) =>
    storyArr2.some((story2) => story1.storyId === story2.storyId),
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
  let favStories = !updateFavStoryList
    ? getFavStoriesList(storyList.stories, currentUser.favorites)
    : updateFavStoryList
  $favStoriesList.empty()
  // loop through all of our stories and generate HTML for them
  for (let story of favStories) {
    const $story = generateFavStoryMarkup(story)
    $favStoriesList.append($story)
  }

  $favStoriesList.show()
}

function generateUsersStoryMarkup(story) {
  console.debug('generateFavStoryMarkup', story)

  const hostName = story.getHostName()
  return $(`
      <li id="${story.storyId}">
        <span class="trash">
        <i class="fas fa-trash-alt"></i>
        </span>
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

function putUsersStoriesOnPage(usersStories) {
  console.debug('putUsersStoriesOnPage')
  // let usersStories = currentUser.ownStories
  $usersStoriesList.empty()

  // loop through all of our stories and generate HTML for them
  for (let story of usersStories) {
    const $story = generateUsersStoryMarkup(story)
    $usersStoriesList.append($story)
  }

  $usersStoriesList.show()
}

/** When a user clicks trash icon on own story, it deletes the story:
 *
 * - saves the story to a list of favorite stories
 * - saves the list of favorite stories to local storage for page refreshes
 * - allows logged in users to see a separate list of favorited stories
 * - shows a nav link to their favorited stories
 */
async function deleteUsersStory(evt) {
  evt.preventDefault
  const targetTagName = evt.target.tagName
  const targetHasClassFaTrash = evt.target.classList.contains('fa-trash-alt')
  const parent = evt.target.parentElement.parentElement

  // Check if not icon or doesn't have fa-star class
  if (targetTagName !== 'I' || !targetHasClassFaTrash) return

  const liStoryId = evt.target.parentElement.parentElement.id

  // Deletes Story
  const result = await storyList
    .deleteUserStory(currentUser, liStoryId)
    .then(parent.remove())

  // Filter out deleted story, and return new own stories list
  updatedOwnStoryList = filterStories(updatedOwnStoryList, liStoryId)

  // Reloads User's own stories with the deleted story removed
  putUsersStoriesOnPage(updatedOwnStoryList)
}

// Check to see if users stories has been updated with a value;
//otherwise, return currentUser.ownStories
function checkOwnStories(updatedList, usersList) {
  return updatedList !== undefined ? updatedList : usersList
}

// Filter out deleted story and return new array
const filterStories = (ownStoriesList, storyId) =>
  ownStoriesList.filter((story) => story.storyId !== storyId)

// Event Listeners
addStoryForm.addEventListener('submit', submitStoryForm)

const storyLists = [$allStoriesList, $favStoriesList, $usersStoriesList]
storyLists.forEach((list) => {
  list.on('click', toggleFavoriteStories)
})

$usersStoriesList.on('click', deleteUsersStory)
