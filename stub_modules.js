//
// Designmap
//
function designmap_spread_module(canvas, tub, json_object){
    //console.log('designmap_spread_module');
    //console.log(json_object);

    if(Object.prototype.toString.call( json_object ) === '[object Array]') {
        // multiple
        json_object.forEach( function (item) {
            tub['spread_files_src'].push(item['@attributes'].src);

            //console.log(item['@attributes'].src);
        });
    }else{
        // single
        tub['spread_files_src'].push(json_object['@attributes'].src);
    }
}




//
// Preferences
//
function documentpreference_module(canvas, tub, json_object){
    //console.log('documentpreference_module');
    //console.log(json_object);

    //tub['page_info'].push({'PageHeight': json_object['@attributes'].PageHeight, 'PageWidth':json_object['@attributes'].PageWidth});
    tub['page_info']['PageHeight'] = json_object['@attributes'].PageHeight;
    tub['page_info']['PageWidth'] = json_object['@attributes'].PageWidth;
}










//
// Spread
//
function spread_module(canvas, tub, json_object){
    console.log('spread_module');
    //console.log(json_object);
}

function flattenerpreference_module(canvas, tub, json_object){
    console.log('flattenerpreference_module');
    //console.log(json_object);
}

// function page_module(canvas, tub, json_object){}
//function rectangle_module(canvas, tub, json_object){}




//
// Story
//
function story_module(canvas, tub, json_object){
    console.log('story_module');
    //console.log(json_object);
}

function storypreference_module(canvas, tub, json_object){
    console.log('storypreference_module');
    //console.log(json_object);
}

function incopyexportoption_module(canvas, tub, json_object){
    console.log('incopyexportoption_module');
    //console.log(json_object);
}

function paragraphstylerange_module(canvas, tub, json_object){
    console.log('paragraphstylerange_module');
    //console.log(json_object);
}

function characterstylerange_module(canvas, tub, json_object){
    console.log('characterstylerange_module');
    //console.log(json_object);
}