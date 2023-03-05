const recipesModel = new RecipesModel()
const renderer = new Renderer()
const ingredientInput = $("#new-recipes-input")

const paginationNumbers = document.getElementById("pagination-numbers");
const nextButton = document.getElementById("next-button");
const prevButton = document.getElementById("prev-button");

const paginationLimit = 4;
let pageCount = 0
let currentPage;

const display = function() {
    const ingredient = ingredientInput.val()
    let isDairyChecked = $('#dairy')[0].checked
    let isGlutenChecked = $('#gluten')[0].checked
    $.get(`recipes/${ingredient}?dairyFilter=${isDairyChecked}&glutenFilter=${isGlutenChecked}`)
        .then(recipesData => {
            recipesModel.addRecipesData(recipesData.recipes)
            pageCount = Math.ceil(recipesModel.getRecipesData().length / paginationLimit);
            getPaginationNumbers();
            setCurrentPage(1);
        })
}
$("#show-recipes").on('click', display)

$("#recipes").on('click', "img", function() {
    alert($(this).closest(".recipe").find("ul li").first().text())
})

const appendPageNumber = (index) => {
    const pageNumber = document.createElement("button");
    pageNumber.className = "pagination-number";
    pageNumber.innerHTML = index;
    pageNumber.setAttribute("page-index", index);
    pageNumber.setAttribute("aria-label", "Page " + index);
    paginationNumbers.appendChild(pageNumber);

};
const getPaginationNumbers = () => {
    for (let i = 1; i <= pageCount; i++) {
        appendPageNumber(i);
    }
    document.querySelectorAll(".pagination-number").forEach((button) => {
        const pageIndex = Number(button.getAttribute("page-index"));
        if (pageIndex) {
            button.addEventListener("click", () => {
                setCurrentPage(pageIndex);
            });
        }
    });

    prevButton.addEventListener("click", () => {
        setCurrentPage(currentPage - 1);
    });
    nextButton.addEventListener("click", () => {
        setCurrentPage(currentPage + 1);
    });
};

const handleActivePageNumber = () => {
    document.querySelectorAll(".pagination-number").forEach((button) => {
        button.classList.remove("active");

        const pageIndex = Number(button.getAttribute("page-index"));
        if (pageIndex == currentPage) {
            button.classList.add("active");
        }
    });
};

const disableButton = (button) => {
    button.classList.add("disabled");
    button.setAttribute("disabled", true);
};
const enableButton = (button) => {
    button.classList.remove("disabled");
    button.removeAttribute("disabled");
};
const handlePageButtonsStatus = () => {
    if (currentPage === 1) {
        disableButton(prevButton);
    } else {
        enableButton(prevButton);
    }
    if (pageCount === currentPage) {
        disableButton(nextButton);
    } else {
        enableButton(nextButton);
    }
};

const setCurrentPage = (pageNum) => {
    currentPage = pageNum;

    handleActivePageNumber();
    handlePageButtonsStatus();

    const prevRange = (pageNum - 1) * paginationLimit;
    const currRange = pageNum * paginationLimit;
    let currentRecipes = []
    renderer.renderRecipesData(recipesModel.getRecipesData())
    const paginatedRecipesList = document.getElementById("recipes");
    const listRecipes = paginatedRecipesList.querySelectorAll(".recipe");
    listRecipes.forEach((recipe, index) => {
        recipe.classList.add("hidden");
        if (index >= prevRange && index < currRange) {
            currentRecipes.push(recipe);
        }
    });
    renderer.renderRecipesData(currentRecipes)
};