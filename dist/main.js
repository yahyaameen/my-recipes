const recipesModel = new RecipesModel()
const renderer = new Renderer()
const ingredientInput = $("#new-recipes-input")

const display = function() {
    const ingredient = ingredientInput.val()
    let isDairyChecked = $('#dairy')[0].checked
    let isGlutenChecked = $('#gluten')[0].checked
    $.get(`recipes/${ingredient}?dairyFilter=${isDairyChecked}&glutenFilter=${isGlutenChecked}`)
        .then(recipesData => {
            recipesModel.addRecipesData(recipesData.recipes)
            renderer.renderRecipesData(recipesModel.getRecipesData())
        })
}
$("#show-recipes").on('click', display)

$("#recipes").on('click', "img", function() {
    alert($(this).closest(".recipe").find("ul li").first().text())
})