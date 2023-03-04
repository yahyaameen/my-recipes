class Renderer {

    renderRecipesData(recipes) {
        $('#recipes').empty()
        const source = $('#recipes-template').html()
        const template = Handlebars.compile(source)
        const recipesData = {
            recipes: recipes
        }
        const newHTML = template(recipesData)
        $('#recipes').append(newHTML)
    }
}