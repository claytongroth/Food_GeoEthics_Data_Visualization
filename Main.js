
    
function setMap(){   
    
    d3.csv("/data/nu3Food_EmissionsData2.csv").then(function(data) {
    d3.csv("/data/sums.csv").then(function(data3) {
    d3.json("/data/a.topojson").then(function(data2) {
        var width = window.innerWidth * 0.425, // 960
            height = 460;
        
        //variable for later use
        var activeDistrict;
        
        //set widths for chart
        var chartWidth = window.innerWidth * 0.425,
                chartHeight = 473,
                leftPadding = 10,
                rightPadding = 0,
                topBottomPadding = 5,
                chartInnerWidth = chartWidth - leftPadding - rightPadding,
                chartInnerHeight = chartHeight - topBottomPadding * 2,
                translate = "translate(" + leftPadding + "," + topBottomPadding + ")";
        //create map svg
        var map = d3.select("body")
            .append("svg")
            .attr("class", "map")
            .attr("width", width)
            .attr("height", chartHeight)
            .call(d3.zoom().on("zoom", function () {
                map.attr("transform", d3.event.transform)
            }))
            .append("g")
        
        //create new svg containers for the 4 charts and sources panel      
        var chart = d3.select("body")
            .append("svg")
            .attr("width", width)
            .attr("height", chartHeight)
            .attr("class", "chart");
        var chart2 = d3.select("body")
            .append("svg")
            .attr("width", ((width * 2)+ 4)/3)
            .attr("height", chartHeight/2)
            .attr("class", "chart2");
        var chart3 = d3.select("body")
            .append("svg")
            .attr("width", ((width * 2)+ 4)/3)
            .attr("height", chartHeight/2)
            .attr("class", "chart3");
        var chart4 = d3.select("body")
            .append("svg")
            .attr("width", ((width * 2)+ 4)/3)
            .attr("height", chartHeight/2)
            .attr("class", "chart4");
        var sources = d3.select("body")
            .append("svg")
            .attr("width", ((width * 2)+ 34))
            .attr("height", chartHeight/4)
            .attr("class", "sources");

        //create world porjection
        var projection = d3.geoNaturalEarth1()
            .center([0, 0])
            .rotate([-2, 0, 0])
            //.parallels([43, 62])
            .scale(175)
            .translate([width / 2, height / 2]);
        var path = d3.geoPath()
            .projection(projection);
        d3.selectAll(".boundary")
        .style("stroke-width", 1 / 1);
        
        //create the topoJson with the features in question
        var b = topojson.feature(data2, data2.objects.ne_10m_admin_0_countries);
        
        //create the graticule
        var graticule = d3.geoGraticule();
        
        //establish the value array
        var attrArray = ["Pork (Supplied Kg/Person/Year)",	"Pork (kg/CO2/Person/Year)",	"Poultry (Supplied Kg/Person/Year)",	"Poultry (kg/CO2/Person/Year)",	"Beef (Supplied Kg/Person/Year)",	"Beef (kg/CO2/Person/Year)",	"LambGoat (Supplied Kg/Person/Year)",	"LambGoat (kg/CO2/Person/Year)",	"Fish (Supplied Kg/Person/Year)",	"Fish (kg/CO2/Person/Year)",	"Eggs (Supplied Kg/Person/Year)",	"Eggs (kg/CO2/Person/Year)",	"Dairy (Supplied Kg/Person/Year)",	"Dairy (kg/CO2/Person/Year)",	"Animal Total (kg/CO2/Person/Year)",	"Wheat (Supplied Kg/Person/Year)",	"Wheat (kg/CO2/Person/Year)",	"Rice (Supplied Kg/Person/Year)",	"Rice (kg/CO2/Person/Year)",	"Soy (Supplied Kg/Person/Year)",	"Soy (kg/CO2/Person/Year)",	"Nuts (Supplied Kg/Person/Year)",	"Nuts (kg/CO2/Person/Year)",	"Non-Animal Total (kg/CO2/Person/Year)",	"Difference Animal-Nonanimal (kg/CO2/Person/Year)"];

        
        //join csv and topoJ data
        function joinData(b, data){
        //loop through csv to assign each set of csv attribute values to geojson region
            for (var i=0; i<data.length; i++){
                var csvRegion = data[i]; //the current region
                var csvKey = data[i].Country; //the CSV primary key
                  //console.log(data[i].Country)
            //loop through geojson regions to find correct region
                for (var a=0; a<b.features.length; a++){     
                    var geojsonProps = b.features[a].properties; //gj props
                    var geojsonKey = geojsonProps.ADMIN; //the geojson primary key
                    //where primary keys match, transfer csv data to geojson properties object
                    if (geojsonKey == csvKey){
                        //assign all attributes and values
                        attrArray.forEach(function(attr){
                            var val = parseFloat(csvRegion[attr]); //get csv attribute value
                            geojsonProps[attr] = val; //assign attribute and value to geojson properties
                        });
                    };

                };
            };
            return b;
      };
        joinData(b,data);
        
        // establish multiplier variable for later use
        var mult = 0;
        
        //create the tooltip
        var tooltip = d3.select("body").append("div") 
            .attr("class", "tooltip")       
            .style("opacity", 0);
        //title/prompt
        var toolTitle = d3.select("#toolTitle").html("<p>Select a Country...</p>");
        
        
        //Dynamically Call the current food variable to change the map
        var currentFood = "Select a Food...";
        
        // create an array of all the values of the current food selection
        var valArray = [];
        data.forEach(function(element) {
            valArray.push(parseInt(element[currentFood]));
        });
        
        //define the current maximum value of the selection array
        var currentMax = Math.max.apply(null, valArray.filter(function(n) { return !isNaN(n); }));
        console.log("Current Max Value is " + currentMax + " for " + currentFood)
        
        //color for later use        
        var color = d3.scaleQuantile()
            .domain(d3.range(0, (currentMax + 10)))
            .range(d3.schemeGreens[7]); 
        
        // this function sets the map, bar chart, pie chart "onclick", and the modeling chart       
        function setChart(data, data2, currentMax, valArray){

            d3.selectAll("path").remove();
            var color = d3.scaleQuantile()
                .domain(d3.range(0, currentMax))
                .range(d3.schemeGreens[7]);  
            
            map.append("path")
                .datum(graticule)
                .attr("class", "graticule")
                .attr("d", path);

            map.append("path")
                .datum(graticule.outline)
                .attr("class", "graticule outline")
                .attr("d", path);

           var countries = map.selectAll("countries")
                .data(b.features)
                .enter()
                .append("path")
                .attr("d", path)
                //.style("stroke", "black")
                .on("mouseover", function(d) { 
                    d3.select(this).style("cursor", "pointer"),
                    activeDistrict = d.properties.ADMIN,
                    chart.selectAll("rect")
                    .each(function(d) {
                        if(d){
                            //console.log("activeDistrict = " + activeDistrict)
                            if (d.Country == activeDistrict){
                                console.log("confirmed" + d.Country)
                                d3.select(this).style("stroke", "#ffd040").style("stroke-width", "2");

                            }
                        }
                    })
                    tooltip.transition()    
                    .duration(200)    
                    .style("opacity", .9)
                    .style("stroke-opacity", 1.0);    
                    tooltip.html(d.properties.ADMIN + "<br/>"  + d.properties[currentFood] + "(kg)")  
                    .style("left", (d3.event.pageX) + "px")   
                    .style("top", (d3.event.pageY - 28) + "px")
                    toolTitle.html(d.properties.ADMIN + "<br/>"  + d.properties[currentFood] + "(kg)");
                  })          
                  .on("mouseout", function(d) {
                    activeDistrict = d.properties.ADMIN,
                    chart.selectAll("rect")
                    .each(function(d) {
                        if (d){
                            if (d.Country == activeDistrict){
                                d3.select(this).style("stroke", "none").style("stroke-width", "none");

                            }
                        }
                    })
                    tooltip.transition()    
                    .duration(500)    
                    .style("opacity", 0)
                    .style("stroke-opacity", 0); 
                  })
                .style("fill", function(d) { return color(d.properties[currentFood]) })
                .on("click", function(d){
                        chart3.selectAll("text").remove();
                        chart3.selectAll(".arc").remove();
                    
                        var clickedCountry = d.properties.ADMIN
                        
                        var pieSlices = [];
                    
                        for (var i=0; i < (attrArray.length); i+= 1) {
                                    pieSlices.push([data[findWithAttr(data, "Country", clickedCountry)][attrArray[i]],[attrArray[i]]]); 
                        };
                        
                        console.log("pieSlices " + pieSlices)
                    
                        var chart3Title = chart3.append("text")
                            .attr("x", 10)
                            .attr("y", 20)
                            .attr("class", "chartTitle")
                            .style('fill', 'white')
                            .text(d.properties.ADMIN + " resource info:")
                            .style("font-size","16");
                    
                        var radius = Math.min( 
                            (((chartInnerWidth * 2)+ 4)/3)-5, ((chartInnerHeight/2)-5) 
                        ) / 2;
                        
                        var piecolor = d3.scaleQuantile()
                            .domain(d3.range(0, 1800))
                            .range(d3.schemePurples[7]);
                    
                        var pie = d3.pie()
                            .sort(function(a, b){
                                return a[0]-b[0]
                            })
                            
                            .value(function(d) {  
                                console.log(d[0])
                                return d[0];
                            });
                    
                        var path = d3.arc()
                            .outerRadius(radius - 10)
                            .innerRadius(0);
                        var label = d3.arc()
                            .outerRadius(radius - 40)
                            .innerRadius(radius - 40);
                    
                        var arc = chart3.selectAll(".arc")
                            .data(pie(pieSlices))
                            .enter().append("g")
                            .attr("transform", "translate(" + (((chartInnerWidth * 2)+ 4)/3)/2 + "," + ((chartInnerHeight/2)/1.8 )+5 + ")")
                              .attr("class", "arc")

                    
                            function findWithAttr(array, attr, value) {
                                for(var i = 0; i < array.length; i += 1) {
                                    if(array[i][attr] === value) {
                                        return i;
                                    }
                                }
                                return -1;
                            };
                            
                          arc.append("path")
                            .attr("d", path)
                            .style("fill", function(d) {
                              console.log("AYYYYYY" + d.data[0])
                              return piecolor(d.data[0]);
                            })
                                .on("mouseover", function(d) { 
                                tooltip.transition()   
                                .duration(200)    
                                .style("opacity", .9)
                                .style("stroke-opacity", 1.0); 
                              console.log(d)
                                tooltip.html(d.data[0] + "kg" + "<br>" + d.data[1])
                                .style("left", (d3.event.pageX) + "px")   
                                .style("top", (d3.event.pageY - 28) + "px")
                              })          
                              .on("mouseout", function(d) {
                                tooltip.transition()    
                                .duration(500)    
                                .style("opacity", 0)
                                .style("stroke-opacity", 0); 
                              })
                    
                });
            
        
            var countries;
            chart.selectAll("rect").remove();
            chart.selectAll("text").remove();
            
            var color = d3.scaleQuantile()
                .domain(d3.range(0, (currentMax + 10)))
                .range(d3.schemeGreens[7]); 
            
            var chartBackground = chart.append("rect2")
                .attr("class", "chartBackground")
                .attr("width", chartInnerWidth)
                .attr("height", chartInnerHeight)
                .attr("transform", translate);
            
            var yScale = d3.scaleLinear()
                .range([0, chartHeight])
                .domain([0, (currentMax+10)]);

            var chartTitle = chart.append("text")
                .attr("x", 10)
                .attr("y", 40)
                .attr("class", "chartTitle")
                .style('fill', 'white')
                .text(currentFood);
            
            var chartSub = chart.append("text")
                .attr("x", 20)
                .attr("y", 90)
                .attr("class", "chartSub")
                .style('fill', 'white')
                .text((d3.sum(valArray)*76) + " Billion  World Total");
            
            var goalSub = chart.append("text")
                .attr("x", 20)
                .attr("y", 130)
                .attr("class", "chartSub")
                .style('fill', 'white')
                .text( function(){
                    if (currentFood.includes("CO2")){
                        return ( (((d3.sum(valArray)*76) / 3000000000) * 100).toPrecision(3) + "%" + " of the yearly kg CO2 goal for 2030");
                    }
                    else { return " ";}
                }
                );
                    

            
            var bars = chart.selectAll(".bars")
                .data(data)
                .enter()
                .append("rect")
                .on("mouseover", function(d) {
                    activeDistrict = d.Country,
                    countries.each(function(d) {
                        if (d){
                            if (d.properties.ADMIN == activeDistrict){
                                d3.select(this).style("stroke", "#ffd040").style("stroke-width", "2");
                                console.log(d.properties.ADMIN + "=" + activeDistrict)

                            }
                        }
                    });
                    tooltip.transition()    
                    .duration(200)    
                    .style("opacity", .9)
                    .style("stroke-opacity", 1.0);    
                    tooltip.html(d.Country + "<br/>"  + d[currentFood] + "(kg)")  
                    .style("left", (d3.event.pageX - 100) + "px")   
                    .style("top", (d3.event.pageY - 12) + "px")
                    toolTitle.html(d.Country + "<br/>"  + d[currentFood] + "(kg)");
                  })          
                  .on("mouseout", function(d) {
                    countries.each(function(d) {
                        if (d){
                            if (d.properties.ADMIN == activeDistrict){
                                d3.select(this).style("stroke", "None").style("stroke-width", "None");
                                console.log(d.properties.ADMIN + "=" + activeDistrict)
                            }
                        }
                    });
                    tooltip.transition()    
                    .duration(500)    
                    .style("opacity", 0)
                    .style("stroke-opacity", 0); 
                  })
                .sort(function(a, b){
                return a[currentFood]-b[currentFood]
                })
                .transition() //add animation
                    .delay(function(d, i){
                        return i * 5
                    })
                    .duration(1)
                .attr("class", function(d){
                    return "bars" + d.Country;
                })
                .attr("width", width / data.length - 1)
                .attr("x", function(d, i){
                    return i * (width / data.length);
                })
                .attr("height", function(d){
                    return yScale(parseFloat(d[currentFood]));
                })
                .attr("y", function(d){
                    return chartHeight - yScale(parseFloat(d[currentFood]));
                })
                .style("fill", function(d){ return color(d[currentFood]); });
                
            //inner function to create the modelling window
                    function setParameters (data, data2, data3, currentFood, attrArray, valArray){
                    chart4.selectAll("rect").remove();
                    chart4.selectAll("text").remove();

                    var mult;
                    var chartBackground = chart4.append("rect3")
                        .attr("class", "chart2Background")
                        .attr("width", (((chartInnerWidth * 2)+ 4)/3) )
                        .attr("height", (chartInnerHeight/2) )
                        .attr("transform", translate);
                    var chartTitle = chart4.append("text")
                        .attr("x", 10)
                        .attr("y", 20)
                        .attr("class", "chartTitle")
                        .style('fill', 'white')
                        .text("Model World Food Consumption");

                    var textline = chart4.append("text")
                        .attr("x", 10)
                        .attr("y", 80)
                        .attr("class", "chart4text")
                        .style("fill", "white")
                        .text("If the world reduced (choose a food from above)")
                    var textline = chart4.append("text")
                        .attr("x", 10)
                        .attr("y", 120)
                        .attr("class", "chart4text")
                        .style("fill", "white")
                        .text(currentFood + " by...")

                    var ten = chart4.append("text")
                        .attr("x", 20)
                        .attr("y", 150)
                        .attr("class", "chart4text")
                        .style("fill", "white")
                        .text("10%")
                        .on("click", function(){
                            var mult = .10;
                            updateMult(mult);
                            console.log(mult)
                        })
                         .on("mouseover", function(d) {
                            d3.select(this).style("cursor", "pointer");
                             d3.select(this).attr("font-size", 22).style("fill", "#ffd040");
                          },)
                         .on("mouseout", function(d) {
                            d3.select(this).style("cursor", "default"); 
                            d3.select(this).attr("font-size", 18).style("fill", "white");
                          });

                    var twenty= chart4.append("text")
                        .attr("x", 60)
                        .attr("y", 150)
                        .attr("class", "chart4text")
                        .style("fill", "white")
                        .text("20%")
                        .on("click", function(){
                            var mult = .20;
                            updateMult(mult);
                            console.log(mult)
                        })
                         .on("mouseover", function(d) {
                            d3.select(this).style("cursor", "pointer"); 
                            d3.select(this).attr("font-size", 22).style("fill", "#ffd040");
                          },)
                         .on("mouseout", function(d) {
                            d3.select(this).style("cursor", "default"); 
                             d3.select(this).attr("font-size", 18).style("fill", "white");
                          });
                    var thirty= chart4.append("text")
                        .attr("x", 100)
                        .attr("y", 150)
                        .attr("class", "chart4text")
                        .style("fill", "white")
                        .text("30%")
                        .on("click", function(){
                            var mult = .30;
                            updateMult(mult);
                            console.log(mult)
                        })
                         .on("mouseover", function(d) {
                            d3.select(this).style("cursor", "pointer");
                             d3.select(this).attr("font-size", 22).style("fill", "#ffd040");
                          },)
                         .on("mouseout", function(d) {
                            d3.select(this).style("cursor", "default");
                             d3.select(this).attr("font-size", 18).style("fill", "white");
                          });
                    var fourty= chart4.append("text")
                        .attr("x", 140)
                        .attr("y", 150)
                        .attr("class", "chart4text")
                        .style("fill", "white")
                        .text("40%")
                        .on("click", function(){
                            var mult = .40;
                            updateMult(mult);
                            console.log(mult)
                        })
                         .on("mouseover", function(d) {
                            d3.select(this).style("cursor", "pointer");
                             d3.select(this).attr("font-size", 22).style("fill", "#ffd040");
                          },)
                         .on("mouseout", function(d) {
                            d3.select(this).style("cursor", "default");
                             d3.select(this).attr("font-size", 18).style("fill", "white");
                          });
                    var fifty= chart4.append("text")
                        .attr("x", 180)
                        .attr("y", 150)
                        .attr("class", "chart4text")
                        .style("fill", "white")
                        .text("50%")
                        .on("click", function(){
                            var mult = .50;
                            updateMult(mult);
                            console.log(mult)
                        })
                         .on("mouseover", function(d) {
                            d3.select(this).style("cursor", "pointer");
                             d3.select(this).attr("font-size", 22).style("fill", "#ffd040");
                          },)
                         .on("mouseout", function(d) {
                            d3.select(this).style("cursor", "default");
                             d3.select(this).attr("font-size", 18).style("fill", "white");
                          });
                    var sixty= chart4.append("text")
                        .attr("x", 220)
                        .attr("y", 150)
                        .attr("class", "chart4text")
                        .style("fill", "white")
                        .text("60%")
                        .on("click", function(){
                            var mult = .60;
                            updateMult(mult);
                            console.log(mult)
                        })
                         .on("mouseover", function(d) {
                            d3.select(this).style("cursor", "pointer");
                             d3.select(this).attr("font-size", 22).style("fill", "#ffd040");
                          },)
                         .on("mouseout", function(d) {
                            d3.select(this).style("cursor", "default");
                             d3.select(this).attr("font-size", 18).style("fill", "white");
                          });
                    var seventy= chart4.append("text")
                        .attr("x", 260)
                        .attr("y", 150)
                        .attr("class", "chart4text")
                        .style("fill", "white")
                        .text("70%")
                        .on("click", function(){
                            var mult = .70;
                            updateMult(mult);
                            console.log(mult)
                        })
                         .on("mouseover", function(d) {
                            d3.select(this).style("cursor", "pointer");
                             d3.select(this).attr("font-size", 22).style("fill", "#ffd040");
                          },)
                         .on("mouseout", function(d) {
                            d3.select(this).style("cursor", "default");
                             d3.select(this).attr("font-size", 18).style("fill", "white");
                          });
                    var eighty= chart4.append("text")
                        .attr("x", 300)
                        .attr("y", 150)
                        .attr("class", "chart4text")
                        .style("fill", "white")
                        .text("80%")
                        .on("click", function(){
                            var mult = .80;
                            updateMult(mult);
                            console.log(mult)
                        })
                         .on("mouseover", function(d) {
                            d3.select(this).style("cursor", "pointer");
                             d3.select(this).attr("font-size", 22).style("fill", "#ffd040");
                          },)
                         .on("mouseout", function(d) {
                            d3.select(this).style("cursor", "default");
                             d3.select(this).attr("font-size", 18).style("fill", "white");
                          });
                    var nintey= chart4.append("text")
                        .attr("x", 340)
                        .attr("y", 150)
                        .attr("class", "chart4text")
                        .style("fill", "white")
                        .text("90%")
                        .on("click", function(){
                            var mult = .90;
                            updateMult(mult);
                            console.log(mult)
                        })
                         .on("mouseover", function(d) {
                            d3.select(this).style("cursor", "pointer");
                             d3.select(this).attr("font-size", 22).style("fill", "#ffd040");
                          },)
                         .on("mouseout", function(d) {
                            d3.select(this).style("cursor", "default");
                             d3.select(this).attr("font-size", 18).style("fill", "white");
                          });
                    var hundred= chart4.append("text")
                        .attr("x", 380)
                        .attr("y", 150)
                        .attr("class", "chart4text")
                        .style("fill", "white")
                        .text("100%")
                        .on("click", function(){
                            var mult = 1;
                            updateMult(mult);
                            console.log(mult)
                        })
                         .on("mouseover", function(d) {
                            d3.select(this).style("cursor", "pointer");
                             d3.select(this).attr("font-size", 22).style("fill", "#ffd040");
                          },)
                         .on("mouseout", function(d) {
                            d3.select(this).style("cursor", "default");
                             d3.select(this).attr("font-size", 18).style("fill", "white");
                          });

                            function updateMult(mult){
                                
                            chart4.selectAll(".chart4textmodel").remove();
                            var textline = chart4.append("text")
                                .attr("x", 20)
                                .attr("y", 180)
                                .attr("class", "chart4textmodel")
                                .style("fill", "#ffd040")
                                .text(" World total would be: " + 
                                      parseInt((d3.sum(valArray)*76) -
                                      ((d3.sum(valArray)*76)*mult))
                                );
                            var textline = chart4.append("text")
                                .attr("x", 20)
                                .attr("y", 200)
                                .attr("class", "chart4textmodel")
                                .style("fill", "#ffd040")
                                .text( function(){
                                    if (currentFood.includes("CO2")){
                                        return ( 
                                            ((parseInt((d3.sum(valArray)*76) -
                                      ((d3.sum(valArray)*76)*mult)) 
                                              / 3000000000) * 100).toPrecision(3) + "%" + " of the yearly kg CO2 goal for 2030");
                                    }
                                    else { return " ";}
                                }
                                );
                        };
                };

                setParameters (data, data2, data3, currentFood, attrArray, valArray);
            
            
        }; // setChart end
        
        setChart(data, data2, currentMax, valArray);  
        
        //function to populate the select element
        function createDropdown(data){
            //add select element
            var dropdown = d3.select("#vis-container")
                .append("select")
                .attr("class", "dropdown")
                .on("change", function(){
                changeAttribute(this.value, data)
                });

            //add initial option
            var titleOption = dropdown.append("option")
                .attr("class", "titleOption")
                .attr("disabled", "true")
                .text("Select Attribute");

            //add attribute name options
            var attrOptions = dropdown.selectAll("attrOptions")
                .data(attrArray)
                .enter()
                .append("option")
                .attr("value", function(d){ return d })
                .text(function(d){ return d });
        };
        createDropdown(data);

        //this function creates the "allfoods" bar chart always
        function setAllFoodsChart(data, valArray, currentMax){
            chart2.selectAll("rect").remove();
            chart2.selectAll("text").remove();
            
            //create an array of sums of each food's "column-total"
            
            var yScale = d3.scaleLinear()
                .range([0, 235])
                .domain([0, (100168.65)]);
            
            var foodcolor = d3.scaleQuantile()
                .domain(d3.range(0, 110300))
                .range(d3.schemePurples[7]); 
                        
            var chartBackground = chart2.append("rect3")
                .attr("class", "chart2Background")
                .attr("width", (((chartInnerWidth * 2)+ 4)/3) )
                .attr("height", (chartInnerHeight/2) )
                .attr("transform", translate);
            
            var chartTitle = chart2.append("text")
                .attr("x", 10)
                .attr("y", 20)
                .attr("class", "chartTitle")
                .style('fill', 'white')
                .text("World Foods CO2 Ranking");
            
            // iterate through valArray, sum the columns, make a bar graph of those sums.
             var bars = chart2.selectAll(".bars")
                .data(data3)
                .enter()
                .append("rect")
                .sort(function(a, b){
                return a.Value-b.Value
                })
                .attr("class", function(d){
                    return d.Food;
                })
                .attr("width", ( (((width * 2)+ 4)/3) / data3.length - 1))
                .attr("x", function(d, i){
                    return i * ( (((width * 2)+ 4)/3) / data3.length);
                })
                .attr("height", function(d){
                            return yScale(parseFloat(d.Value));
                })
                .attr("y", function(d){
                    return (chartHeight/2) - yScale(parseFloat(d.Value));;
                })
                .style("fill", function(d){ 
                    return foodcolor(d.Value);
                })
                .on("mouseover", function(d) { 
                    tooltip.transition()    
                    .duration(200)    
                    .style("opacity", .9)
                    .style("stroke-opacity", 1.0);    
                    tooltip.html(d.Food + "<br/>"  + d.Value + " total" + "<br/>"  + "yearly per capita CO2 emissions")
                    .style("left", (d3.event.pageX) + "px")   
                    .style("top", (d3.event.pageY - 28) + "px")
                    .style("stroke", "green !important")
                    .style("stroke-width", "2")
                  })          
                  .on("mouseout", function(d) {
                    tooltip.transition()    
                    .duration(500)    
                    .style("opacity", 0)
                    .style("stroke-opacity", 0); 
                  })

        };
        setAllFoodsChart(data, valArray, currentMax);
       
        // setup the country info svg for when countries are clicked
      function setCountryInfo(data){
            chart3.selectAll("rect").remove();
            chart3.selectAll("text").remove();
          
          var chartBackground = chart3.append("rect3")
                .attr("class", "chart2Background")
                .attr("width", (((chartInnerWidth * 2)+ 4)/3) )
                .attr("height", (chartInnerHeight/2) )
                .attr("transform", translate);
      };
        
        setCountryInfo(data);
        
        
        
        // this function updates all svgs according to the user selection
        function changeAttribute(attribute, data){
            //change the expressed attribute
            currentFood = attribute;
            var valArray = [];
            data.forEach(function(element) {
                valArray.push(parseInt(element[currentFood]));
            });
        
            var currentMax = Math.max.apply(null, valArray.filter(function(n) { return !isNaN(n); }));

            
            var color = d3.scaleQuantile()
                .domain(d3.range(0, currentMax))
                .range(d3.schemeReds[7]); 
            
            //recolor enumeration units
            //drawMap(currentMax);
            //reset chart bars
            setChart(data, data2, currentMax, valArray);
            setAllFoodsChart(data, valArray);
            setParameters(data, data2, data3, currentFood, attrArray);

        };
        
        // creates the sources svg
        function createSources(){
            
            var chartBackground = sources.append("rect3")
                .attr("class", "chart2Background")
                .attr("width", ((width * 2)+ 34))
                .attr("height", chartHeight/4)
                .attr("transform", translate);
            var sourcesheadline = sources.append("text")
                .attr("x", 10)
                .attr("y", 20)
                .attr("class", "sourceTitle")
                .style('fill', 'white')
                .text("Sources and Info");
           var sourcestext1 = sources.append("text")
                .attr("x", 20)
                .attr("y", 60)
                .attr("class", "sourceTitle")
                .style('fill', 'white')
                .style("font-size", ".75em" )
                .text("Data sources: www.nu3.de, FAO/FAOStat");
            var sourcestext1 = sources.append("text")
                .attr("x", 20)
                .attr("y", 80)
                .attr("class", "sourceTitle")
                .style('fill', 'white')
                .style("font-size", ".75em" )
                .text("Emissions data included only concerns emissions within the fences for production of a given food source. No upstream or downstream emissions are included. ");
            var sourcestext1 = sources.append("text")
                .attr("x", 20)
                .attr("y", 100)
                .attr("class", "sourceTitle")
                .style('fill', 'white')
                .style("font-size", ".75em" )
                .text("Supplied resource data only concerns resources supplied for human food consumption. This data does not account for imports and exports.");
                
        };
        createSources();
        
        
        
    }); //csv
    }); //json
    }); //sums csv
 
 
}; // end of setmap  
    
    
    