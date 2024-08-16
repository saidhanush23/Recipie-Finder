const searchBtn = document.getElementById('search-btn');
const mealList = document.getElementById('meal');
const mealDetailsContent = document.querySelector('.meal-details-content');
const recipeCloseBtn = document.getElementById('recipe-close-btn');

// Event listeners
searchBtn.addEventListener('click', getMealList);
mealList.addEventListener('click', getMealRecipe);
recipeCloseBtn.addEventListener('click', () => {
    mealDetailsContent.parentElement.classList.remove('showRecipe');
});

// Get meal list based on search or show all Indian meals if search is empty
function getMealList() {
    let searchInputTxt = document.getElementById('search-input').value.trim();
    if (searchInputTxt === "") {
        fetchAllIndianMeals()
            .then(allMeals => {
                displayMeals(allMeals);
            })
            .catch(error => {
                console.error('Error fetching all Indian meals:', error);
                mealList.innerHTML = "An error occurred while fetching the meal data. Please try again.";
            });
    } else {
        fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${searchInputTxt}`)
            .then(response => response.json())
            .then(data => {
                let html = "";
                if (data.meals) {
                    data.meals.forEach(meal => {
                        html += `
                            <div class="meal-item" data-id="${meal.idMeal}">
                                <div class="meal-img">
                                    <img src="${meal.strMealThumb}" alt="food">
                                </div>
                                <div class="meal-name">
                                    <h3>${meal.strMeal}</h3>
                                    <a href="#" class="recipe-btn">Get Recipe</a>
                                </div>
                            </div>
                        `;
                    });
                    mealList.classList.remove('notFound');
                } else {
                    html = "Sorry, we didn't find any meals!";
                    mealList.classList.add('notFound');
                }

                mealList.innerHTML = html;
            })
            .catch(error => {
                console.error('Error fetching the meal data:', error);
                mealList.innerHTML = "An error occurred while fetching the meal data. Please try again.";
            });
    }
}

// Fetch all Indian meals (handling large results)
async function fetchAllIndianMeals() {
    let allMeals = [];
    let currentPage = 1;
    const maxPages = 10; // Limit the number of pages to fetch

    while (currentPage <= maxPages) {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?a=Indian&page=${currentPage}`);
        const data = await response.json();
        if (data.meals && data.meals.length > 0) {
            allMeals = allMeals.concat(data.meals);
            currentPage++;
        } else {
            break;
        }
    }

    return allMeals;
}

// Display meals in the UI
function displayMeals(meals) {
    let html = "";
    meals.forEach(meal => {
        html += `
            <div class="meal-item" data-id="${meal.idMeal}">
                <div class="meal-img">
                    <img src="${meal.strMealThumb}" alt="food">
                </div>
                <div class="meal-name">
                    <h3>${meal.strMeal}</h3>
                    <a href="#" class="recipe-btn">Get Recipe</a>
                </div>
            </div>
        `;
    });

    mealList.classList.remove('notFound');
    mealList.innerHTML = html;
}

// Get recipe of the meal
function getMealRecipe(e) {
    e.preventDefault();
    if (e.target.classList.contains('recipe-btn')) {
        let mealItem = e.target.parentElement.parentElement;
        fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealItem.dataset.id}`)
            .then(response => response.json())
            .then(data => mealRecipeModal(data.meals))
            .catch(error => {
                console.error('Error fetching the meal recipe:', error);
                mealDetailsContent.innerHTML = "An error occurred while fetching the meal recipe. Please try again.";
            });
    }
}



function mealRecipeModal(meal) {
    meal = meal[0];
    let html = `
        <h2 class="recipe-title">${meal.strMeal}</h2>
        <p class="recipe-category">${meal.strCategory}</p>
        <div class="recipe-instruct">
            <h3>Instructions:</h3>
            <p>${meal.strInstructions}</p>
        </div>
        <div class="recipe-meal-img">
            <img src="${meal.strMealThumb}" alt="">
        </div>
        <div class="recipe-link">
            <a href="${meal.strYoutube}" target="_blank">Watch Video</a>
        </div>
    `;
    mealDetailsContent.innerHTML = html;
    mealDetailsContent.parentElement.classList.add('showRecipe');
}