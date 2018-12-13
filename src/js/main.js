// import d3Tooltip from './d3-tip'
const mainGraphic = () => {





    // graphic code
    var format = d3.format(",");

    var s = 1;


    // // Set tooltips
    // var tip = d3.tip()
    //             // .attr('class', 'd3-tip')
    //             .offset([-10, 0])
    // 						.direction('s');
    // .direction(direction.bind(this));

    // Get bounds of div enclosing the graphic
    var bounds = d3.select('.world_map').node().getBoundingClientRect()

    var margin = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        },
        wth = window.innerWidth || window.documentElment.clientWidth || window.getElementsByTagName('.world_map')[0].clientWidth,
        ht = window.innerHeight || window.documentElment.clientHeight || window.getElementsByTagName('.world_map')[0].clientHeight,
        width = wth - margin.left - margin.right,
        height = ht - margin.top - margin.bottom;

    var path = d3.geoPath();


    var mapZoom = d3.zoom().on("zoom", freeZoom);

    function freeZoom() {
        g.attr("transform", d3.event.transform);
    }

    var svg = d3.select(".world_map")
        .append("svg")
        // .call(mapZoom)
        // .append("#instructions")
        .call(mapZoom)
        .attr("width", width)
        .attr("height", height)
        .classed("svg-content-responsive", true);

    svg.append("rect")
        .attr("class", "map_background")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")

    // .on("click", clicked);



    var scaleNum = 200;
    var scaleDiv = 9;
    var center = [width / 3.2, 0.7 * height];

    var projection = d3.geoMercator()
        .scale(scaleNum)
        .translate(center);



    var path = d3.geoPath().projection(projection);

    // svg.call(tip);


    var g = svg.append("g")
        .attr('class', 'map')


    // var map_instructions = svg.append("text")
    //                  .attr("x", width*0.5)
    //                  .attr("y", height*0.98)
    //                  .text("Click on country to zoom. Click on background to reset view.")
    //                  .attr("font-family", "sans-serif")
    //                  .attr("font-size", "0.7em")
    //                  .attr("fill", "black");

    function update_map(map_choice) {

        //  svg.selectAll("*").remove();

        var adv_map = map_choice == 'adv';

        var colorArray = ["#d7191c", "#2c7bb6", "#fdae61", "#F2F27A", "#e9e9e9"]

        var color = d3.scaleOrdinal()
            .domain(["Negative", "Positive", "Unsure", "Both", "N/A"])
            .range(colorArray);


        queue()
            .defer(d3.json, "https://raw.githubusercontent.com/dashee87/dashee87.github.io/master/_includes/world_topo.json")
            // .defer(d3.tsv, "./assets/world_trump7.tsv")
            .defer(d3.csv, "./assets/world_trump1.csv")
            .await(ready);



        function ready(error, data, country_info) {
            if (error) throw error
            var byCountries = {},
                byYear = {},
                byComments = {},
                byQuotes = {};

            country_info.forEach(function(d) {

                byCountries[d.countryCode] = d.country;
                byYear[d.countryCode] = d.year;
                byComments[d.countryCode] = d.comments;
                byQuotes[d.countryCode] = d.quotes;
                // ByRank[d.countryID] = parseInt(d.home_adv_rank) + 1;
                // ByLeague[d.countryCode] = d.league;

            });

            data.objects.countries.geometries.forEach(function(d) {
                if (typeof byYear[d.properties.countryCode] == 'undefined') {
                    // alert(d.properties.countryCode);
                    byYear[d.properties.countryCode] = "";
                    byComments[d.properties.countryCode] = "N/A";
                    byQuotes[d.properties.countryCode] = "No public comment";
                    // ByLeague[d.properties.countryCode] = "N/A";
                }
                // d.avg_goals = byYear[d.properties.countryCode];

            });

            d3.selectAll(".countries")
                .remove();



            g.append("g")
                .attr("class", "countries")
                .selectAll("path")
                .data(topojson.feature(data, data.objects.countries).features)
                .enter().append("path")
                .attr("d", path)
                .style("fill", null)
                .style("fill", function(d) {
                    return color(byComments[d.properties.countryCode]);
                })
                .style('stroke', 'black')
                .style('stroke-width', 1.5)
                .style("opacity", 0.8)
                // tooltips
                .style("stroke", "white")
                .style('stroke-width', 0.3)
                // displayInst(d);
                // .on("click", clicked)
                .text(function(d){ displayInst(d)})
                .on('mouseover', function(d) {

                    // displayInst(d);
                    //
                    // tip.html(function(d) {
                    //
                    //
                    // 					// return "<strong>Country: </strong><span class='details'>" + d.properties.country  + "<br></span>" + "<strong>Year: </strong><span class='details'>" + byYear[d.properties.countryCode] + "<br></span>" + "<strong>Quotes: </strong><span class='details'>" + byQuotes[d.properties.countryCode] + "</span>" ;
                    // 					return "<span class='details'>" + d.properties.country  + "<br><br></span>" + "<span class='detailsQuotes'>" + byQuotes[d.properties.countryCode] + "<br><br></span>" + "<span class='detailsYear'>" + byYear[d.properties.countryCode] + "</span>" ;
                    //
                    //   })
                    // .show(d);

                    d3.select(this)
                        .style("opacity", 1)
                        .style("stroke","black")
                        .style("stroke-width", 1.2 / parseFloat(Math.pow(s, 1.2)));
                        // .style("stroke-width", 4.0 / parseFloat(Math.pow(s, 1.6)));
                })
                .on('click', function(d){
                    hideInst(d);
                    displayData(d);
                })
                .on('mouseout', function(d) {
                    // tip.hide(d);

                    // hideData();

                    d3.select(this)
                        .style("opacity", 0.8)
                        .style("stroke", "white")
                        .style("stroke-width", 0.3);
                });

            svg.append("path")
                .datum(topojson.mesh(data, data.objects.countries.geometries, function(a, b) {
                    return a !== b;
                }))
                // .datum(topojson.mesh(data.features, function(a, b) { return a !== b; }))
                .attr("class", "names")
                .attr("d", path);

                function displayInst(d){
                    d3.select("#instructions")
                        .text("Hover over and click the countries to see what Trump said about them.");
                }
                function hideInst(d){
                    d3.select("#instructions")
                        .text("");
                }
                function displayData(d){
                    d3.select("#country")
                        .text(d.properties.country)

                    d3.select("#quote")
                        .html(byQuotes[d.properties.countryCode])

                    d3.select("#year")
                        .text(byYear[d.properties.countryCode]);
                }

                function hideData(){
                    d3.select("#country")
                         .text("")

                    d3.select("#quote")
                         .html("")

                    d3.select("#year")
                         .text("");
                }
        }


    }




    d3.select("#zoom_in").on("click", function() {
        mapZoom.scaleBy(svg.transition().duration(500), 1.5);
    });

    d3.select("#zoom_out").on("click", function() {
        mapZoom.scaleBy(svg.transition().duration(500), 0.7);
    });


    update_map("adv");
    // // run code
    // init();


}

export default mainGraphic
