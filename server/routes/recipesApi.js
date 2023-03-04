const express = require('express')
const axios = require('axios')
const router = express.Router()

const isRecipeContainGlutenAndDairy = function(ingredients, dairyIngredients, glutenIngredients) {
    const dairyAndGluten = dairyIngredients.concat(glutenIngredients)
    for (const ingredient of ingredients) {
        const splitIngredient = ingredient.split(' ')
        for (const ingredientSubString of splitIngredient) {
            if (dairyAndGluten.includes(ingredientSubString.charAt(0).toUpperCase() + ingredientSubString.slice(1))) {
                return true
            }
        }
    }
    return false
}

const isRecipeContainDairy = function(ingredients, dairyIngredients) {
    for (const ingredient of ingredients) {
        const splitIngredient = ingredient.split(' ')
        for (const ingredientSubString of splitIngredient) {
            if (dairyIngredients.includes(ingredientSubString.charAt(0).toUpperCase() + ingredientSubString.slice(1))) {
                return true
            }
        }
    }
    return false
}

const isRecipeContainGluten = function(ingredients, glutenIngredients) {
    for (const ingredient of ingredients) {
        const splitIngredient = ingredient.split(' ')
        for (const ingredientSubString of splitIngredient) {
            if (glutenIngredients.includes(ingredientSubString.charAt(0).toUpperCase() + ingredientSubString.slice(1))) {
                return true
            }
        }
    }
    return false
}

const isRecipeContainSensitivityFilters = function(recipe, dairyFilter, glutenFilter) {
    const dairyIngredients = ["Cream", "Cheese", "Milk", "Butter", "Creme", "Ricotta", "Mozzarella", "Custard", "Cream Cheese"]
    const glutenIngredients = ["Flour", "Bread", "Spaghetti", "Biscuits", "Beer"]
    if (dairyFilter === 'true' && glutenFilter === 'true') {
        return isRecipeContainGlutenAndDairy(recipe.ingredients, dairyIngredients, glutenIngredients)
    } else if (dairyFilter === 'true' && glutenFilter === 'false') {
        return isRecipeContainDairy(recipe.ingredients, dairyIngredients)
    } else {
        return isRecipeContainGluten(recipe.ingredients, glutenIngredients)
    }
}

const filteringRecipesBySensitivity = function(filteringRecipes, dairyFilter, glutenFilter) {
    let filteringRecipesBySensitivity = []
    if (dairyFilter === 'false' && glutenFilter === 'false') {
        return filteringRecipesBySensitivity
    }
    for (const recipe of filteringRecipes) {
        if (!isRecipeContainSensitivityFilters(recipe, dairyFilter, glutenFilter)) {
            filteringRecipesBySensitivity.push(recipe)
        }
    }
    return filteringRecipesBySensitivity
}
router.get('/recipes/:ingredient', (req, res) => {
    const ingredient = req.params.ingredient
    axios.get(`https://recipes-goodness-elevation.herokuapp.com/recipes/ingredient/${ingredient}`)
        .then(function(response) {
            const recipes = response.data.results
            const filteringRecipes = recipes.map(r => ({
                "idMeal": r.idMeal,
                "title": r.title,
                "thumbnail": r.thumbnail,
                "href": r.href,
                "ingredients": r.ingredients
            }))
            const dairyFilter = req.query.dairyFilter
            const glutenFilter = req.query.glutenFilter
            let filteringRecipesArrayBySensitivity = []
            filteringRecipesArrayBySensitivity = filteringRecipesBySensitivity(filteringRecipes, dairyFilter, glutenFilter)
            if (filteringRecipesArrayBySensitivity.length !== 0) {
                res.send({ recipes: filteringRecipesArrayBySensitivity })
            } else {
                res.send({ recipes: filteringRecipes })
            }
        })
})

module.exports = router