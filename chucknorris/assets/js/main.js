//global variables for pagination
var resultsPerPage = 10;
var totalRecords = 0;
var page = 1;
var totalPages = 0;
var records ;

$(document).ready(function(){
    //run following functions after document load
    fetchCategories();  //fetch fact categories dynamically
    fetchFact();        //fetch a random chuck norris fact
    $("#searchPagination").hide();  //hides pagination at start
    $('[data-toggle="tooltip"]').tooltip(); //enables all tooltip
    bindPaginationControl();    //bind click events to all pagination buttons
});

//fetch fact categories dynamically
function fetchCategories(){
    $.get({
        url: "https://api.chucknorris.io/jokes/categories"
    }).done(function(data){

        for(i=0;i<data.length;i++){
            var optionNode = document.createElement('option');
            optionNode.text = data[i];
            optionNode.value = data[i];
            $("#chuckNorrisCategories").append(optionNode);
        }
    }).fail(function(){
        console.log("Error occurred")
    });
}

//fetch a random chuck norris fact
function fetchFact(){

    //hide and show certain elements
    $("#randomFact").show();
    $("#searchCards").hide();
    $("#searchPagination").hide();

    //show spinner and disable button until we get promise
    $("#submit_button").attr("disabled",true);
    $("#submit_button .spinner").show();
    $("#submit_button .btntext").hide();

    //select joke category
    var category = $('#chuckNorrisCategories').val();
    if(category == "null"){
        requestURL = "https://api.chucknorris.io/jokes/random";
    }else{
        requestURL = "https://api.chucknorris.io/jokes/random?category="+category;
    }
    
    // ajax request
    $.get({
        url: requestURL
    }).done(function(data){
        $("#submit_button").attr("disabled",false);
        $("#submit_button .spinner").hide();
        $("#submit_button .btntext").show();
        $("#chuckNorrisFact").text(data.value);

    }).fail(function(){
        $("#submit_button").attr("disabled",false);
        $("#submit_button .spinner").hide();
        $("#submit_button .btntext").show();

    });
}

//copy to element text to clipboard
// params : element to be selected by querySelector
function copyToClipboard(element){
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val($(element).text()).select();
    document.execCommand("copy");
    $temp.remove();
}

// change tooltip title of a element 
function changeTitle(element,newTitle,oldTitle){
    $(element).attr('data-original-title',newTitle)
                .tooltip('show')
                .attr('data-original-title',oldTitle);
}

// search chuck norris fact 
function searchFact(){

    // hide or show certain elements
    $("#randomFact").hide();
    $("#searchCards").show();
    $("#searchCards").children().not("#searchStatus").remove();

    // get search key
    searchKey = "";
    searchKey = $("#searchFactInput").val().trim();
    if(searchKey.length<=2){
        // console.log("Plese enter at least 3 characters.");
        $("#search_error").text("Enter at least 3 characters.");

    }else{

        // change text of certain elements
        $("#search_error").text("");
        $('#searchStatus').text("Searching...");

        // show loader and hide button text
        $("#searchFactButton").attr("disabled",true);
        $("#searchFactButton .spinner").show();
        $("#searchFactButton .btntext").hide();

        // ajax request
        requestURL = "https://api.chucknorris.io/jokes/search?query="+searchKey;

        $.get({
            url: requestURL
        }).done(function(data){

            // hide loader and show button text
            $("#searchFactButton").attr("disabled",false);
            $("#searchFactButton .spinner").hide();
            $("#searchFactButton .btntext").show();

            if(data.total == 0){
                // empty result
                $('#searchStatus').text("No facts for: "+searchKey);

            }else{

                // change value of global variables
                page = 1;
                records = data.result;
                totalRecords = records.length;
                totalPages = Math.ceil(totalRecords/resultsPerPage);

                // update text of search result status
                $('#searchStatus').text("Showing "+totalRecords+" Result for: "+searchKey);

                if(totalRecords <= resultsPerPage){
                    // hide pagination and show all search result
                    $("#searchPagination").hide();
                    for(i=0;i<totalRecords;i++){
                        createSearchCard(records,i);
                    }
                    // enable tooltip for newly created elements
                    $('[data-toggle="tooltip"]').tooltip();

                }else{
                    // show pagination and page 1 of search result
                    $("#searchPagination").show();
                    showResults(1,records)
                }

            }
        }).fail(function(){
            console.log("Error occurred")
        });        

    }
}

// create card for each fact with create element
function createSearchCard(records,i){

    var mainCardNode = document.createElement('div');
    mainCardNode.classList = 'col-lg-6 m-auto py-3';

    var cardNode = document.createElement('div');
    cardNode.className = 'card';

    var cardBodyNode = document.createElement('div')
    cardBodyNode.className = 'card-body';

    var cardFooterNode = document.createElement('div')
    cardFooterNode.classList = 'card-footer bg-white';

    var paraNode = document.createElement('p');
    paraNode.classList = 'lead font-italic';
    paraNode.setAttribute('data-copy-text-id',(i+1));
    var textNode = document.createTextNode(records[i].value);
    paraNode.appendChild(textNode);

    var buttonNode = document.createElement('button');
    buttonNode.classList= 'btn btn-primary';
    buttonNode.setAttribute('data-copy-button-id',(i+1));
    buttonNode.setAttribute('data-toggle','tooltip');
    buttonNode.setAttribute('title','Copy To Clipboard')
    textNode = document.createTextNode("Copy Fact");
    buttonNode.setAttribute('onclick',"copyToClipboard2(this,'Copied','Copy To Clipboard')");
    buttonNode.appendChild(textNode);
    
    //append elements to create complete card
    cardBodyNode.appendChild(paraNode);
    cardFooterNode.appendChild(buttonNode);
    cardNode.appendChild(cardBodyNode);
    cardNode.appendChild(cardFooterNode);
    mainCardNode.appendChild(cardNode);
    $("#searchCards").append(mainCardNode);

}

// copy to clipboard and set tooltip title for each card button
// we use data-copy-button-id and data-copy-text-id to select target element
// select elements pair where data-copy-button-id == data-copy-text-id
function copyToClipboard2(element,newTitle,oldTitle){
    var id = $(element).attr('data-copy-button-id');
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val($('[data-copy-text-id="'+id+'"]').text()).select();
    document.execCommand("copy");
    $temp.remove();

    //change tooltip text 
    $(element).attr('data-original-title',newTitle)
            .tooltip('show')
            .attr('data-original-title',oldTitle);
}

// show results for given page no
function showResults(page,records){
    start = (page-1)*resultsPerPage;
    end = start+resultsPerPage <= totalRecords ? start+resultsPerPage : totalRecords;

    //remove previous results before appending new results
    $("#searchCards").children().not("#searchStatus").remove();

    // console.log('start--'+start+'end--'+end+"totalpages--"+totalPages);
    for(i=start;i<end;i++){
        createSearchCard(records,i);
    }

    // enable tooltip for newly created elements
    $('[data-toggle="tooltip"]').tooltip();

    //after appending records update pagination button states
    updatePagination();
}

//bind click events to each pagination button
function bindPaginationControl(){
    $("#pagNext").on('click',function(e){
        page=page+1;
        showResults(page,records);
    });
    $("#pagPrev").on('click',function(e){
        page=page-1;
        showResults(page,records);
    });
    $("#pagFirst").on('click',function(){
        page=1;
        showResults(page,records);
    })
    $("#pagLast").on('click',function(){
        page=totalPages;
        showResults(page,records);
    })
}

// check and change button state of pagination
function updatePagination(){
    checkPagPrev();
    checkPagNext();
}

// check or change state of next button
function checkPagNext(){
    if(page>=totalPages){
        $("#pagNext").attr('disabled',true);
    }else{
        $("#pagNext").attr('disabled',false);
    }
}

// check or change state of prev button
function checkPagPrev(){
    if(page<=1){
        $("#pagPrev").attr('disabled',true);
    }else{
        $("#pagPrev").attr('disabled',false);
    }
}
