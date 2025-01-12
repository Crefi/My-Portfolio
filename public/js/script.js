

//  Theme button

const themes = ['theme-light', 'theme-dark', 'theme-blue', 'theme-pink'];
const themeButton = document.getElementById('theme-button');
const themeMenu = document.getElementById('theme-menu');

let hideTimeout; 

// Load the theme from localStorage or default to the first theme
function loadTheme() {
  const savedTheme = localStorage.getItem('selectedTheme') || themes[2]; // Set the default theme 
  document.documentElement.classList.remove(...themes);
  document.documentElement.classList.add(savedTheme);

  // Update the button text to reflect the current theme
  const themeText = savedTheme.split('-')[1].charAt(0).toUpperCase() + savedTheme.split('-')[1].slice(1);
  themeButton.textContent = `${themeText} `;
}

// Save the selected theme to localStorage
function saveTheme(theme) {
  localStorage.setItem('selectedTheme', theme);
}

// Open dropdown menu
function openDropdown() {
  clearTimeout(hideTimeout);
  themeMenu.parentNode.classList.add('open');
  themeMenu.style.opacity = '1';
  themeMenu.style.visibility = 'visible';
}

// Close dropdown menu with delay
function closeDropdown() {
  hideTimeout = setTimeout(() => {
    themeMenu.parentNode.classList.remove('open');
    themeMenu.style.opacity = '0';
    themeMenu.style.visibility = 'hidden';
  }, 200);
}

// Handle theme selection
themeMenu.addEventListener('click', (event) => {
  const selectedTheme = event.target.dataset.theme;
  if (selectedTheme) {
    document.documentElement.classList.remove(...themes);
    document.documentElement.classList.add(selectedTheme);
    saveTheme(selectedTheme);
    themeButton.textContent = `${event.target.textContent}`;

    console.log(`Switched to ${selectedTheme}`);
  }

  closeDropdown();
});

// Keep dropdown open when hovering over the menu
themeMenu.addEventListener('mouseenter', () => {
  clearTimeout(hideTimeout);
});

// Hide dropdown when mouse leaves
themeMenu.addEventListener('mouseleave', closeDropdown);

// Close dropdown if clicking outside
document.addEventListener('click', (event) => {
  if (!themeButton.contains(event.target) && !themeMenu.contains(event.target)) {
    closeDropdown();
  }
});

// Initialize the theme on page load
document.addEventListener('DOMContentLoaded', loadTheme);

// Toggle dropdown menu visibility on button click
themeButton.addEventListener('click', () => {
  if (themeMenu.parentNode.classList.contains('open')) {
    closeDropdown();
  } else {
    openDropdown();
  }
});




const slides = document.querySelectorAll('.slider__slide');
const sliderContainer = document.querySelector('.slider'); // The slider container itself
let currentSlide = 0;

// Navigation buttons
const prevButton = document.querySelector('.slider__prev');
const nextButton = document.querySelector('.slider__next');

// Function to update slide position
function showSlide(index) {

  // Adjust the transform property on the slider container
  sliderContainer.style.transition = 'transform 0.5s ease-in-out'; 
  sliderContainer.style.transform = `translateX(-${index * 100}%)`; // Shift the slider container

}

// Show the initial slide (index 0) correctly
showSlide(currentSlide);

// Event listener for the previous button
prevButton.addEventListener('click', () => {
  currentSlide = (currentSlide > 0) ? currentSlide - 1 : slides.length - 1; 
  showSlide(currentSlide);
});

// Event listener for the next button
nextButton.addEventListener('click', () => {
  currentSlide = (currentSlide < slides.length - 1) ? currentSlide + 1 : 0; 
  showSlide(currentSlide);
});




// Code section


// Helper function to determine the programming language from file extensions
function getLanguageFromExtension(fileName) {
  const extension = fileName.split('.').pop().toLowerCase();
  const languageMap = {
    js: 'javascript',
    css: 'css',
    html: 'markup',
    json: 'json',
    py: 'python',
    php: 'php'
  };
  return languageMap[extension] || 'plaintext'; 
}

// Extract the project name from the active button or URL
function getProjectName() {
  const projectLink = document.querySelector('.button--primary.active');
  if (projectLink && projectLink.dataset.project) {
    return projectLink.dataset.project;
  }

  const pathParts = window.location.pathname.split('/');
  const fileName = pathParts[pathParts.length - 1];
  const match = fileName.match(/project-page(\d+)\.html/);
  if (match) {
    return `project${match[1]}`;
  }

  return null; // Return null if no project name is determined
}

// Function to toggle visibility of the sidebar when the 'Show Code' button is clicked
document.getElementById('show-code-button').addEventListener('click', () => {
  const codeShowcase = document.getElementById('code-showcase');
  
  if (codeShowcase.classList.contains('hidden')) {
    // Show the sidebar
    codeShowcase.classList.remove('hidden');
    codeShowcase.classList.add('visible');

    // Fetch and populate the sidebar again if it's being shown
    fetchFileList(); 

  } else {
    // Hide the sidebar
    codeShowcase.classList.remove('visible');
    codeShowcase.classList.add('hidden');
  }
});

// Function to populate the sidebar with folders and files
function populateSidebar(items, parentPath = '') {
  const fileList = document.querySelector(".code-showcase__file-list");
  fileList.innerHTML = ""; // Clear any existing file list items

  // Iterate over the items (files/folders) and add them to the sidebar
  items.forEach((item) => {
    const listItem = document.createElement("li");
    listItem.className = "code-showcase__file-item";
    listItem.textContent = item.name;
    listItem.dataset.file = item.name;

    const fullPath = parentPath ? `${parentPath}/${item.name}` : item.name;

    if (item.type === "directory") {
      listItem.classList.add("folder");
      listItem.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleFolderVisibility(listItem, item.children, fullPath);
      });
    } else {
      listItem.classList.add("file");
      listItem.addEventListener("click", () => {
        document.querySelectorAll(".code-showcase__file-item").forEach((item) => item.classList.remove("active"));
        listItem.classList.add("active");
        fetchCodeFile(fullPath); 
      });
    }

    fileList.appendChild(listItem); 
  });
}

// Function to handle the visibility of child folders when a folder is clicked
function toggleFolderVisibility(listItem, children, parentPath) {
  if (!children) return;

  const isOpen = listItem.classList.contains("open");
  if (isOpen) {
    listItem.classList.remove("open");
    const childList = listItem.querySelector(".code-showcase__folder-list");
    if (childList) childList.remove();
  } else {
    listItem.classList.add("open");
    const folderList = document.createElement("ul");
    folderList.className = "code-showcase__folder-list";

    // For each child in the folder, create a new list item
    children.forEach((child) => {
      const childItem = document.createElement("li");
      childItem.className = "code-showcase__file-item";
      childItem.textContent = child.name;
      childItem.dataset.file = child.name;

      const childFullPath = `${parentPath}/${child.name}`;

      // Handle child folders and files
      if (child.type === "directory") {
        childItem.classList.add("folder");
        childItem.addEventListener("click", (e) => {
          e.stopPropagation();
          toggleFolderVisibility(childItem, child.children, childFullPath);
        });
      } else {
        childItem.classList.add("file");
        childItem.addEventListener("click", () => {
          document.querySelectorAll(".code-showcase__file-item").forEach((item) => item.classList.remove("active"));
          childItem.classList.add("active");
          fetchCodeFile(childFullPath);
        });
      }

      folderList.appendChild(childItem);
    });

    listItem.appendChild(folderList); 
  }
}

// Function to fetch the file list based on the project name
async function fetchFileList() {
  const projectName = getProjectName(); 
  if (!projectName) {
    alert("Error: Unable to determine the project name.");
    return;
  }

  try {
    const response = await fetch(`/api/files?project=${projectName}`);
    if (!response.ok) throw new Error(`Failed to load file list: ${response.statusText}`);

    const items = await response.json();
    populateSidebar(items); // Populate the sidebar with the fetched file/folder data

    if (items.length > 0) {
      const firstFile = items[0].name;
      fetchCodeFile(firstFile); // Fetch code for the first file (optional)
      document.querySelector(`.code-showcase__file-item[data-file="${firstFile}"]`).classList.add("active");
    }
  } catch (error) {
    console.error(error);
    alert("Error loading file list");
  }
}

// Function to fetch and display code for the selected file
async function fetchCodeFile(fileName) {
  const projectName = getProjectName();
  if (!projectName) {
    alert("Error: Unable to determine the project name.");
    return;
  }

  try {
    const response = await fetch(`/projects/${projectName}/${fileName}`);
    if (!response.ok) throw new Error(`Failed to load ${fileName}: ${response.statusText}`);

    let code = await response.text();

    // Display the code in the editor
    const codeDisplay = document.getElementById("code-display");
    const currentFile = document.getElementById("current-file");

    codeDisplay.textContent = code.trim();
    currentFile.textContent = fileName;

    // Detect and apply language class
    const language = getLanguageFromExtension(fileName);
    codeDisplay.className = `language-${language}`;

    // Reapply syntax highlighting using Prism.js
    Prism.highlightElement(codeDisplay);
  } catch (error) {
    console.error(error);
    const codeDisplay = document.getElementById("code-display");
    codeDisplay.textContent = `Error loading file: ${fileName}`;
  }
}

// Initialize the sidebar when the page loads
document.addEventListener('DOMContentLoaded', () => {
  const codeShowcase = document.getElementById('code-showcase');
  if (codeShowcase && !codeShowcase.classList.contains('visible')) {
    // Automatically fetch and populate the file list if not already visible
    fetchFileList();
  }
});





// comment section 

// Select DOM elements
const commentForm = document.querySelector('.comments__form');
const commentsList = document.querySelector('.comments__list');
const commentTextarea = document.querySelector('.comments__textarea');
const usernameInput = document.querySelector('#username'); 

// Get the project ID from the URL
const projectId = window.location.pathname.split('/').pop().replace('.html', '');  

// Fetch initial comments for the specific project
fetchComments();

async function fetchComments() {
  try {
    const response = await fetch(`/api/comments?projectId=${projectId}`); 
    if (!response.ok) {
      throw new Error('Failed to fetch comments');
    }

    const comments = await response.json();

    if (Array.isArray(comments)) {
      commentsList.innerHTML = ''; // Clear the comments list before rendering
      comments.forEach(comment => {
        // Render each comment here
        const commentElement = document.createElement('div');
        commentElement.classList.add('comment');

        const userElement = document.createElement('p');
        userElement.classList.add('comment__user');
        userElement.innerHTML = `<strong>${comment.user}</strong> says:`;

        const textElement = document.createElement('p');
        textElement.classList.add('comment__text');
        textElement.textContent = comment.text;

        // Render replies for this comment
        const repliesList = document.createElement('div');
        repliesList.classList.add('replies');
        comment.replies.forEach(reply => {
          const replyElement = document.createElement('div');
          replyElement.classList.add('reply');

          const replyUserElement = document.createElement('p');
          replyUserElement.classList.add('reply__user');
          replyUserElement.innerHTML = `<strong>${reply.user}</strong> replied:`;

          const replyTextElement = document.createElement('p');
          replyTextElement.classList.add('reply__text');
          replyTextElement.textContent = reply.text;

          replyElement.appendChild(replyUserElement);
          replyElement.appendChild(replyTextElement);
          repliesList.appendChild(replyElement);
        });

        // Add a reply form below each comment
        const replyForm = document.createElement('form');
        replyForm.classList.add('reply-form');
        const replyTextarea = document.createElement('textarea');
        replyTextarea.classList.add('reply-textarea');
        replyTextarea.placeholder = 'Write your reply here...';
        replyForm.appendChild(replyTextarea);

        const replyButton = document.createElement('button');
        replyButton.type = 'submit';
        replyButton.classList.add('button', 'button--primary');
        replyButton.textContent = 'Post Reply';
        replyForm.appendChild(replyButton);

        // Handle the reply submission
        replyForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const replyText = replyTextarea.value;
          const user = 'User'; 
          
          try {
            const response = await fetch(`/api/comments/${comment._id}/reply`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ user, text: replyText }),
            });
            const updatedComment = await response.json();
            fetchComments(); // Refresh the comment list after posting the reply
          } catch (err) {
            console.error('Error posting reply:', err);
          }
        });

        // Append everything to the comment
        commentElement.appendChild(userElement);
        commentElement.appendChild(textElement);
        commentElement.appendChild(repliesList);
        commentElement.appendChild(replyForm);

        commentsList.appendChild(commentElement);
      });
    } else {
      console.error("Expected comments to be an array, but got:", comments);
    }
  } catch (error) {
    console.error('Error fetching comments:', error);
  }
}

// Function to post a comment
commentForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const user = usernameInput.value; 
  const text = commentTextarea.value;

  // If user hasn't entered a username show an error
  if (!user.trim()) {
    alert('Please enter a username');
    return;
  }

  try {
    const response = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, text, projectId }),  
    });
    const newComment = await response.json();
    fetchComments(); // Refresh the comment list after posting
  } catch (err) {
    console.error('Error posting comment:', err);
  }
});
