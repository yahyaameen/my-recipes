const express = require('express')
const axios = require('axios')
const router = express.Router()
const sensitivityData = require('./sensitivityData')

const isRecipeIngredientsContainSensitivityFilters = function(SensitivityDataArray, ingredients) {
    for (const ingredient of ingredients) {
        const splitIngredient = ingredient.split(' ')
        for (const ingredientSubString of splitIngredient) {
            if (SensitivityDataArray.includes(ingredientSubString.toLowerCase())) {
                return true
            }
        }
    }
    return false
}

const isRecipeContainGlutenAndDairy = function(ingredients, dairyIngredients, glutenIngredients) {
    const dairyAndGluten = dairyIngredients.concat(glutenIngredients)
    return isRecipeIngredientsContainSensitivityFilters(dairyAndGluten, ingredients)
}

const isRecipeContainDairy = function(ingredients, dairyIngredients) {
    return isRecipeIngredientsContainSensitivityFilters(dairyIngredients, ingredients)
}

const isRecipeContainGluten = function(ingredients, glutenIngredients) {
    return isRecipeIngredientsContainSensitivityFilters(glutenIngredients, ingredients)
}

const isRecipeContainSensitivityFilters = function(recipe, dairyFilter, glutenFilter) {
    const dairyIngredients = sensitivityData.dairyIngredients
    const glutenIngredients = sensitivityData.glutenIngredients
    const dairyIngredientsLowerCase = dairyIngredients.map(d => d.toLowerCase())
    const glutenIngredientsLowerCase = glutenIngredients.map(g => g.toLowerCase())
    if (dairyFilter === 'true' && glutenFilter === 'true') {
        return isRecipeContainGlutenAndDairy(recipe.ingredients, dairyIngredientsLowerCase, glutenIngredientsLowerCase)
    } else if (dairyFilter === 'true' && glutenFilter === 'false') {
        return isRecipeContainDairy(recipe.ingredients, dairyIngredientsLowerCase)
    } else {
        return isRecipeContainGluten(recipe.ingredients, glutenIngredientsLowerCase)
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

const recipesPagination = function(recipesArray, recipesStartIndex, recipesLastIndex) {
    let paginationRecipesArray = []
    for (const index in recipesArray) {
        if (index >= recipesStartIndex && index <= recipesLastIndex) {
            paginationRecipesArray.push(recipesArray[index]);
        }
    }
    return paginationRecipesArray
};

const isPrevPaginationEnable = function(recipesStartIndex) {
    const FIRST_INDEX = 0
    return recipesStartIndex > FIRST_INDEX ? true : false
}

const isNextPaginationEnable = function(recipesArray, recipesLastIndex) {
    return recipesLastIndex < (recipesArray.length - 1) ? true : false
}

const getFilteringRecipes = function(recipes) {
    return recipes.map(r => ({
        "idMeal": r.idMeal,
        "title": r.title,
        "thumbnail": r.thumbnail,
        "href": r.href,
        "ingredients": r.ingredients
    }))
}

const sendingRecipesData = function(parameters) {
    let paginationRecipesArray = []
    let isNextPagination = undefined
    let isPrevPagination = undefined
    if (parameters.dairyFilter === 'true' || parameters.glutenFilter === 'true') {
        paginationRecipesArray = recipesPagination(parameters.filteringRecipesArrayBySensitivity, parameters.recipesStartIndex, parameters.recipesLastIndex)
        isNextPagination = isNextPaginationEnable(parameters.filteringRecipesArrayBySensitivity, parameters.recipesLastIndex)
        isPrevPagination = isPrevPaginationEnable(parameters.recipesStartIndex)
        parameters.res.send({
            recipes: paginationRecipesArray,
            isPrevPagination: isPrevPagination,
            isNextPagination: isNextPagination
        })
    } else {
        paginationRecipesArray = recipesPagination(parameters.filteringRecipes, parameters.recipesStartIndex, parameters.recipesLastIndex)
        isNextPagination = isNextPaginationEnable(parameters.filteringRecipes, parameters.recipesLastIndex)
        isPrevPagination = isPrevPaginationEnable(parameters.recipesStartIndex)
        parameters.res.send({
            recipes: paginationRecipesArray,
            isPrevPagination: isPrevPagination,
            isNextPagination: isNextPagination
        })
    }
}

router.get('/recipes/:ingredient', (req, res) => {
    const ingredient = req.params.ingredient
    const recipesStartIndex = parseInt(req.query.recipesStartIndex)
    const recipesLastIndex = parseInt(req.query.recipesLastIndex)
    const dairyFilter = req.query.dairyFilter
    const glutenFilter = req.query.glutenFilter
    let filteringRecipesArrayBySensitivity = []
    axios.get(`https://recipes-goodness-elevation.herokuapp.com/recipes/ingredient/${ingredient}`)
        .then(function(response) {
            const recipes = response.data.results
            const filteringRecipes = getFilteringRecipes(recipes)
            filteringRecipesArrayBySensitivity = filteringRecipesBySensitivity(filteringRecipes, dairyFilter, glutenFilter)
            const sendingRecipesDataParameters = {
                res: res,
                dairyFilter: dairyFilter,
                glutenFilter: glutenFilter,
                filteringRecipesArrayBySensitivity: filteringRecipesArrayBySensitivity,
                filteringRecipes: filteringRecipes,
                recipesStartIndex: recipesStartIndex,
                recipesLastIndex: recipesLastIndex
            }
            sendingRecipesData(sendingRecipesDataParameters)
        })
})

module.exports = router