const recipesModel = new RecipesModel()
const renderer = new Renderer()
const ingredientInput = $("#new-recipes-input")

const nextButton = document.getElementById("next-button")
const prevButton = document.getElementById("prev-button")
const PAGINATION_LIMIT = 4
let recipesStartIndex = 0
let recipesLastIndex = 3

const disableButton = (button) => {
    button.classList.add("disabled")
    button.setAttribute("disabled", true)
}
const enableButton = (button) => {
    button.classList.remove("disabled")
    button.removeAttribute("disabled")
}

const updateNextAndPrevStatus = function(isPrevEnable, isNextEnable) {
    isPrevEnable ? enableButton(prevButton) : disableButton(prevButton)
    isNextEnable ? enableButton(nextButton) : disableButton(nextButton)
}

const updateStartAndLastCurrentPageIndex = function(paginitionDirection) {
    if (paginitionDirection === "next") {
        recipesStartIndex += PAGINATION_LIMIT;
        recipesLastIndex += PAGINATION_LIMIT;
    } else {
        recipesStartIndex -= PAGINATION_LIMIT;
        recipesLastIndex -= PAGINATION_LIMIT;
    }
};

const displayRecipes = function() {
    const ingredient = ingredientInput.val()
    let isDairyChecked = $('#dairy')[0].checked
    let isGlutenChecked = $('#gluten')[0].checked
    $.get(`recipes/${ingredient}?dairyFilter=${isDairyChecked}&glutenFilter=${isGlutenChecked}&recipesStartIndex=${recipesStartIndex}&recipesLastIndex=${recipesLastIndex}`)
        .then(recipesData => {
            recipesModel.addRecipesData(recipesData.recipes)
            renderer.renderRecipesData(recipesModel.getRecipesData())
            updateNextAndPrevStatus(recipesData.isPrevPagination, recipesData.isNextPagination)
        })
}
$("#show-recipes").on('click', displayRecipes)

$("#recipes").on('click', "img", function() {
    alert($(this).closest(".recipe").find("ul li").first().text())
})

prevButton.addEventListener("click", () => {
    updateStartAndLastCurrentPageIndex("prev");
    displayRecipes();
})
nextButton.addEventListener("click", () => {
    updateStartAndLastCurrentPageIndex("next");
    displayRecipes();
})