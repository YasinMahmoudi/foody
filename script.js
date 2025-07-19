'use strict';

const loading = document.querySelector('.loading');
const mealContainer = document.querySelector('.meal-container__wrapper');
const modal = document.querySelector('.modal');
const btnModalClose = document.querySelector('.modal__close');
const searchForm = document.querySelector('.form');
const searchInput = document.querySelector('.form__input');
const heading = document.querySelector('.heading');
const searchResult = document.querySelector('#searchResult');

////////////////////////////////  MEAL CLASS  //////////////////////////
class Meal {
  constructor() {}

  async _searchByName(searchTerm) {
    try {
      const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${searchTerm}`);
      if (!res.ok) throw new Error(`Somthing wrong happend ! please try again later`);
      return await res.json();
    } catch (error) {
      mealContainer.innerHTML = `${error.message}`;
    }
  }

  async _getMealDetails(id) {
    try {
      const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
      if (!res.ok) throw new Error(`Somthing wrong happend ! please try again later`);
      return await res.json();
    } catch (error) {
      mealContainer.innerHTML = `${error.message}`;
    }
  }
}

////////////////////////////////  APP CLASS  //////////////////////////
class App extends Meal {
  constructor() {
    super();
    searchForm.addEventListener('submit', this._search.bind(this));
    mealContainer.addEventListener('click', this._showMealDetails.bind(this));
    btnModalClose.addEventListener('click', this._closeModal.bind(this));
  }

  //// LOADING STATE
  _initialLoading(state) {
    if (state) loading.classList.remove('loading__hidden');
    else loading.classList.add('loading__hidden');
  }

  //// CHECK LOADING
  _setLoading(state = false) {
    return this._initialLoading(state);
  }

  //// SEARCH MEAL
  async _search(e) {
    this._setLoading('true');

    e.preventDefault();

    // Check input validation
    const searchInputLength = searchInput.value.length;
    if (!searchInputLength) return;

    const searchText = searchInput.value;
    searchResult.textContent = searchText;

    heading.classList.remove('heading__hidden');

    try {
      // Get search results from API
      const data = await this._searchByName(searchText);
      const { meals } = data;

      if (!meals) throw new Error('No meals found !');

      mealContainer.innerHTML = '';

      this._renderMealCard(meals);
    } catch (error) {
      mealContainer.innerHTML = `${error.message}`;
    }

    this._setLoading();
  }

  //// RENDER MEAL CARD
  _renderMealCard(meals) {
    meals.forEach((meal) => {
      // Creat Element
      const el = document.createElement('div');
      el.classList.add('meal');
      el.setAttribute('data-id', meal.idMeal);
      el.innerHTML = `
                <div class="meal__img bg-animate">
              <img
                src="${meal.strMealThumb}/preview"
                alt="${meal.strMeal}"
                loading="lazy"
              />
            </div>

            <div class="meal__details">
              <h3 class="meal__name bg-animate animated-bg-text"> &nbsp; </h3>
            </div>
    `;

      // Add load event for image
      el.querySelector('img').addEventListener('load', function () {
        el.querySelector('.meal__img').classList.remove('bg-animate');
      });

      setTimeout(() => {
        el.querySelector('.meal__name').classList.remove('bg-animate', 'animated-bg-text');
        el.querySelector('.meal__name').innerHTML = meal.strMeal;
      }, 1000);

      // Add Card to DOM
      mealContainer.append(el);
    });

    document.querySelectorAll('.meal').forEach((meal) => meal.addEventListener('click', this._getMealDetails));
  }

  //// ACTIVE MODAL AND SHOMW MEAL DETAILS
  async _showMealDetails(e) {
    const meal = e.target.closest('.meal');
    if (!meal) return;

    modal.classList.remove('modal__hidden');

    // Get meal id from datase
    const { id } = meal.dataset;

    // Get meal details from API
    const data = await this._getMealDetails(id);

    const ings = [[], []];

    for (let i = 1; i <= 20; i++) {
      data.meals[0][`strIngredient${i}`] && ings[0].push(data.meals[0][`strIngredient${i}`]);
      data.meals[0][`strMeasure${i}`] !== ' ' && ings[1].push(data.meals[0][`strMeasure${i}`]);
    }

    const {
      strMeal: name,
      strCategory: category,
      strArea: area,
      strMealThumb: image,
      strInstructions: instruction,
    } = data.meals[0];

    // Render data
    this._renderData(modal, '.modal__img', ` <img src="${image}/preview" alt="${name}" /> `);
    this._renderData(modal, '.name', name);
    this._renderData(modal, '.category', `${category} - ${area}`);
    this._renderData(modal, '.recepit', instruction);

    let ingsItems = '';
    for (let i = 0; i < ings[0].length; i++) {
      ingsItems += `
      <li class="ings__item">
        <span class="ings__key bg-animate animated-bg-text"> ${ings[0][i]} </span>
        <span class="ings__value bg-animate animated-bg-text">${ings[1][i]} </span>
      </li>
      `;
    }

    this._renderData(modal, '.ings__list', ingsItems);

    // Remove animated background
    modal.querySelectorAll('.bg-animate').forEach((bg) => bg.classList.remove('bg-animate'));
  }

  //// CLOSE MODAL FOR EACH MEAL
  _closeModal() {
    modal.classList.add('modal__hidden');

    const ingsItems = `
    <li class="ings__item">
          <span class="ings__key bg-animate">&nbsp; </span>
          <span class="ings__value bg-animate">&nbsp; </span>
    </li>
`;

    this._renderData(modal, '.modal__img');
    this._renderData(modal, '.name', '&nbsp;');
    this._renderData(modal, '.category', '&nbsp;; ');
    this._renderData(modal, '.recepit', ' &nbsp; &nbsp; &nbsp; &nbsp &nbsp; &nbsp; &nbsp; &nbsp');
    this._renderData(modal, '.ings__list', ingsItems);
  }

  //// Render Data in modal helper function
  _renderData(element, className, content = '') {
    element.querySelector(`${className}`).innerHTML = `${content}`;
    element.querySelector(`${className}`).classList.toggle('bg-animate');
  }
}

const meal = new Meal();
const app = new App();
