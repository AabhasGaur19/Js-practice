const API_KEY = '444bfc3de61a46dcba1a59bd9745d7a2';de
const API_BASE_URL = 'https://api.spoonacular.com/recipes';

const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const cuisineFilter = document.getElementById('cuisineFilter');
const recipesGrid = document.getElementById('recipesGrid');
const recipeModal = document.getElementById('recipeModal');
const closeModal = document.getElementById('closeModal');
const loadingSpinner = document.getElementById('loadingSpinner');
const darkModeToggle = document.getElementById('darkModeToggle');
const body = document.body;

darkModeToggle.addEventListener('click', toggleDarkMode);

function toggleDarkMode() {
    body.classList.toggle('dark:bg-gray-900');
    
    const elementsToToggle = {
        '.bg-white': 'dark:bg-gray-800',
        '.text-gray-800': 'dark:text-white',
        '.border-gray-300': 'dark:border-gray-600',
        '.text-gray-600': 'dark:text-gray-300'
    };

    for (const [selector, toggleClass] of Object.entries(elementsToToggle)) {
        document.querySelectorAll(selector).forEach(element => {
            element.classList.toggle(toggleClass);
        });
    }

    darkModeToggle.classList.toggle('dark:bg-gray-700');
    darkModeToggle.querySelector('i').classList.toggle('dark:text-yellow-300');
}
searchButton.addEventListener('click', searchRecipes);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchRecipes();
});

async function searchRecipes() {
    const query = searchInput.value.trim();
    const cuisine = cuisineFilter.value;
    
    if (!query) return;

    showLoading(true);

    try {
        const params = new URLSearchParams({
            apiKey: API_KEY,
            query: query,
            number: 9,
            cuisine: cuisine
        });

        const response = await fetch(`${API_BASE_URL}/complexSearch?${params}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch recipes');
        }

        displayRecipes(data.results);
    } catch (error) {
        console.error('Error fetching recipes:', error);
        displayError('Error fetching recipes. Please try again later.');
    } finally {
        showLoading(false);
    }
}

function displayRecipes(recipes) {
    if (!recipes.length) {
        displayError('No recipes found. Try different search terms.');
        return;
    }

    recipesGrid.innerHTML = recipes.map(recipe => `
        <div class="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-200">
            <img src="${recipe.image}" alt="${recipe.title}" class="w-full h-48 object-cover">
            <div class="p-4">
                <h3 class="text-lg font-semibold text-gray-800 mb-2">${recipe.title}</h3>
                <button onclick="getRecipeDetails(${recipe.id})" 
                        class="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200">
                    View Recipe
                </button>
            </div>
        </div>
    `).join('');
}

function displayError(message) {
    recipesGrid.innerHTML = `
        <div class="col-span-full text-center text-red-500 p-4">
            ${message}
        </div>`;
}

async function getRecipeDetails(recipeId) {
    showLoading(true);

    try {
        const params = new URLSearchParams({
            apiKey: API_KEY
        });

        const response = await fetch(`${API_BASE_URL}/${recipeId}/information?${params}`);
        const recipe = await response.json();

        if (!response.ok) {
            throw new Error(recipe.message || 'Failed to fetch recipe details');
        }

        displayRecipeModal(recipe);
    } catch (error) {
        console.error('Error fetching recipe details:', error);
        displayError('Error fetching recipe details. Please try again later.');
    } finally {
        showLoading(false);
    }
}

function displayRecipeModal(recipe) {
    document.getElementById('modalTitle').textContent = recipe.title;
    
    const content = `
        <img src="${recipe.image}" alt="${recipe.title}" class="w-full h-64 object-cover rounded-lg mb-4">
        
        <div class="grid grid-cols-2 gap-4 mb-4">
            <div class="bg-gray-100 p-3 rounded-lg">
                <p class="text-sm text-gray-600">Ready in</p>
                <p class="text-lg font-semibold text-gray-800">${recipe.readyInMinutes} minutes</p>
            </div>
            <div class="bg-gray-100 p-3 rounded-lg">
                <p class="text-sm text-gray-600">Servings</p>
                <p class="text-lg font-semibold text-gray-800">${recipe.servings}</p>
            </div>
        </div>

        <h3 class="text-xl font-semibold text-gray-800 mb-2">Ingredients</h3>
        <ul class="list-disc pl-5 mb-4 text-gray-700">
            ${recipe.extendedIngredients.map(ingredient => 
                `<li>${ingredient.original}</li>`
            ).join('')}
        </ul>

        <h3 class="text-xl font-semibold text-gray-800 mb-2">Instructions</h3>
        <div class="text-gray-700">
            ${recipe.instructions || 'No instructions available.'}
        </div>
    `;

    document.getElementById('modalContent').innerHTML = content;
    recipeModal.classList.remove('hidden');
}

closeModal.addEventListener('click', () => {
    recipeModal.classList.add('hidden');
});

recipeModal.addEventListener('click', (e) => {
    if (e.target === recipeModal) {
        recipeModal.classList.add('hidden');
    }
});

// Utility Functions
function showLoading(show) {
    loadingSpinner.classList.toggle('hidden', !show);
}