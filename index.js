const carouselTrack = document.querySelector(".carousel-track");
const carouselPrevButton = document.querySelector(".carousel-prev-button");
const carouselNextButton = document.querySelector(".carousel-next-button");

let carouselIndex = 0;

var chart = document.getElementById("charts");
var home = document.getElementById("home");
chart.style.display = "none";

function showOptions() {
  var category = document.getElementById("category").value;
  var subCategoryLabel = document.getElementById("sub-category-label");
  var subCategory = document.getElementById("sub-category");
  if (category == "") {
    chart.style.display = "none";
    home.style.display = "block";
    subCategoryLabel.style.display = "none";
    subCategory.style.display = "none";
    var coptionsEle = document.getElementById("c-options");
    coptionsEle.style.display = "none";
  }
  if (category === "business") {
    subCategory.innerHTML =
      '<option value="">Select</option><option value="new">Setting up New Restaurant</option><option value="already">Already Existing Restraunt</option>';
    subCategoryLabel.style.display = "block";
    subCategory.style.display = "block";
  } else if (category === "user") {
    subCategory.innerHTML = "";
    subCategoryLabel.style.display = "none";
    subCategory.style.display = "none";
    home.style.display = "none";
    chart.style.display = "block";
    var title = document.getElementById("chart-title");
    title.innerHTML = "Top Restaurants based on the location and cuisines";

    var coptionsEle = document.getElementById("c-options");
    coptionsEle.style.display = "none";


    var pieLabel = document.getElementById("pie-label");
    var gridLabel = document.getElementById("grid-label");
    pieLabel.style.display = "none";
    gridLabel.style.display = "none";
    var pie = document.getElementById("pie-container");
    pie.style.display = "none";
    var grid = document.getElementById("grid-container");
    grid.style.display = "none";
    var bar = document.getElementById("bar-container");
    bar.style.display = "none";
    var line = document.getElementById("line-container");
    line.style.display = "none";

    var tree = document.getElementById("tree-container");
    tree.style.display = "block";
    tree.style.height = "82vh";
    tree.style.width = "90%";
    d3.csv("./data/downsampled_zomato.csv").then(function (item) {
      var json = {};

      item.forEach(function (d) {
        Object.keys(d).forEach(function (key) {
          if (!json[key]) {
            json[key] = [];
          }
          json[key].push(d[key]);
        });
      });

      //   //console.log("json: ", json);

      const uniqueCount = json["location"].reduce((countMap, str) => {
        const key = str.toLowerCase().replace(/\s+/g, "");
        countMap.set(key, (countMap.get(key) || 0) + 1);
        return countMap;
      }, new Map());

      const sortedUniqueCount = new Map(
        [...uniqueCount.entries()].sort((a, b) => b[1] - a[1])
      );
      const top10location = [...sortedUniqueCount.keys()].slice(0, 5);
      //   //console.log("10rest: ", top10location);

      let location_wise_cuisines = new Map();
      for (let i = 0; i < 5; i++) {
        //location
        // //console.log("1st loop");
        let pick_location = top10location[i];
        let temp = [];

        for (let j = 0; j < json["cuisines"].length; j++) {
          // cuisines
          if (
            pick_location ==
            json["location"][j].toLowerCase().replace(/\s+/g, "")
          ) {
            // //console.log("if condition");
            let list_cuisine = json["cuisines"][j].split(",");
            list_cuisine.forEach((cuisine) => {
              const cleanedCuisine = cuisine.toLowerCase().replace(/\s+/g, "");
              temp.push(cleanedCuisine);
            });
          }
        }
        // //console.log("temp: ", temp);
        const uniqueCount = temp.reduce((countMap, str) => {
          const key = str.toLowerCase().replace(/\s+/g, "");
          countMap.set(key, (countMap.get(key) || 0) + 1);
          return countMap;
        }, new Map());

        const sortedUniqueCount = new Map(
          [...uniqueCount.entries()].sort((a, b) => b[1] - a[1])
        );

        const top5cuisines = [...sortedUniqueCount.keys()].slice(0, 5);
        const counts = top5cuisines.map((key) => sortedUniqueCount.get(key));

        let pick_loca_dict = new Map();
        for (let j = 0; j < 5; j++) {
          let res_name = new Map();
          for (let k = 0; k < json["cuisines"].length; k++) {
            //resturant name
            let cuisine_list = json["cuisines"][k].split(",");

            let cuisineExist = cuisine_list.some((cuisine) => {
              const cleanedCuisine = cuisine.toLowerCase().replace(/\s+/g, "");
              return cleanedCuisine == top5cuisines[j];
            });
            if (
              cuisineExist &&
              json["location"][k].toLowerCase().replace(/\s+/g, "") ==
                pick_location
            ) {
              if (!isNaN(parseFloat(json["votes"][k])))
                res_name[json["name"][k]] = parseFloat(json["votes"][k]);
            }
          }
          //   //console.log("res name: ",res_name);
          const top5rest = Object.entries(res_name)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

          //   //console.log("top 5 rest: ", top5rest);
          pick_loca_dict[top5cuisines[j]] = top5rest;
        }
        location_wise_cuisines[pick_location] = pick_loca_dict;
      }

      //// finding location based on cuisine on a location

      var dom = document.getElementById("tree-container");
      var myChart = echarts.init(dom, null, {
        renderer: "canvas",
        useDirtyRect: false,
      });
      var app = {};
      //   //console.log('location wise cuisine', location_wise_cuisines)
      let data1 = new Map();
      data1["name"] = "Locations";

      let tempc = [];

      for (let x = 0; x < 5; x++) {
        let dictx = new Map();
        dictx["name"] = top10location[x];
        val_arr = [];
        nameofcusine = Object.keys(location_wise_cuisines[top10location[x]]);

        for (let y = 0; y < nameofcusine.length; y++) {
          let dicty = new Map();
          dicty["name"] = nameofcusine[y];
          //   dicty["value"] =
          restaurant_keys_forcuisine = Object.keys(
            location_wise_cuisines[top10location[x]][nameofcusine[y]]
          );
          // //console.log(location_wise_cuisines[top10location[x]][nameofcusine[y]])
          // //console.log(restaurant_keys_forcuisine.length, 'key length');
          valt = [];
          for (let r = 0; r < restaurant_keys_forcuisine.length; r++) {
            let dictr = new Map();
            dictr["name"] = restaurant_keys_forcuisine[r];
            dictr["value"] =
              location_wise_cuisines[top10location[x]][nameofcusine[y]][
                restaurant_keys_forcuisine[r]
              ];
            valt.push(dictr);
          }
          dicty["children"] = valt;
          val_arr.push(dicty);
        }
        dictx["children"] = val_arr;
        tempc.push(dictx);
      }
      data1["children"] = tempc;
      //   //console.log("data 1 value is", data1);

      var option;

      option = {
        tooltip: {
          trigger: "item",
          triggerOn: "mousemove",
        },
        series: [
          {
            type: "tree",
            id: 0,
            name: "tree1",
            data: [data1],
            top: "5%",
            left: "10%",
            bottom: "5%",
            right: "20%",
            symbolSize: 7,
            edgeShape: "polyline",
            edgeForkPosition: "30%",
            initialTreeDepth: 1,
            lineStyle: {
              width: 1,
            },
            label: {
              fontSize: 14,
              backgroundColor: "#fff",
              position: "left",
              verticalAlign: "middle",
              align: "right",
            },
            leaves: {
              label: {
                position: "right",
                verticalAlign: "middle",
                align: "left",
              },
            },
            tooltip: {
              crossStyle: {
                width: 45,
              },
            },
            emphasis: {
              focus: "descendant",
            },

            expandAndCollapse: true,
            animationDuration: 550,
            animationDurationUpdate: 750,
          },
        ],
      };

      if (option && typeof option === "object") {
        myChart.setOption(option);
      }

      window.addEventListener("resize", myChart.resize);
    });
  } else {
    subCategory.innerHTML = '<option value="">Select</option>';
    subCategoryLabel.style.display = "block";
    subCategory.style.display = "block";
  }
  document.getElementById("options").style.display = "block";
}

function showGraph() {
  var category = document.getElementById("category").value;
  var subcategory = document.getElementById("sub-category").value;
  var subcategoryEle = document.getElementById("options");
  var coptionsEle = document.getElementById("c-options");
  var title = document.getElementById("chart-title");
  var pieLabel = document.getElementById("pie-label");
  var gridLabel = document.getElementById("grid-label");
  pieLabel.style.zIndex = "2";

  ////console.log("--", category, subcategory);

  if (category == "") {
    ////console.log("----");
    subcategoryEle.style.display = "none";
  }
  if (subcategory == "") {
    coptionsEle.style.display = "none";
  }

  if (category == "business" && subcategory == "new") {
    home.style.display = "none";
    chart.style.display = "block";
    title.innerHTML = "Identifying Popular Cuisines";

    pieLabel.style.display = "none";
    gridLabel.style.display = "none";
    var pie = document.getElementById("pie-container");
    pie.style.display = "none";
    var grid = document.getElementById("grid-container");
    grid.style.display = "none";
    var tree = document.getElementById("tree-container");
    tree.style.display = "none";
    var line = document.getElementById("line-container");
    line.style.display = "none";

    coptionsEle.style.display = "none";

    const carouselItemWidth =
      document.querySelector(".carousel-item").offsetWidth;

    var bar = document.getElementById("bar-container");
    bar.style.display = "block";
    bar.style.height = "84vh";
    bar.style.width = "90%";

    var line = document.getElementById("line-container");
    line.style.display = "none";
    line.style.height = "84vh";
    line.style.width = "90%";

    carouselPrevButton.addEventListener("click", () => {
      //console.log("carousel", carouselItemWidth);
      if (carouselIndex > 0) {
        carouselIndex--;
        carouselTrack.style.transform = `translateX(-${
          carouselIndex * carouselItemWidth
        }px)`;
        console.log(carouselIndex);
        line.style.display = "none";
        bar.style.display = "block";
      }
    });

    carouselNextButton.addEventListener("click", () => {
      //console.log("clicked");
      if (carouselIndex < 1) {
        carouselIndex++;
        carouselTrack.style.transform = `translateX(-${
          carouselIndex * carouselItemWidth
        }px)`;
        console.log(carouselIndex);
        bar.style.display = "none";
        line.style.display = "block";
      }
    });
    // BAR CHART
    d3.csv("./data/downsampled_zomato.csv").then(function (data) {
      var json = {};

      data.forEach(function (d) {
        Object.keys(d).forEach(function (key) {
          if (!json[key]) {
            json[key] = [];
          }
          json[key].push(d[key]);
        });
      });

      //////console.log("json keys: ", Object.keys(json));

      cuisines = json["cuisines"];

      let targetArray = [];
      //////console.log(cuisines[0]);
      for (let i = 0; i < cuisines.length; i++) {
        let arr = cuisines[i].split(", ");

        arr.forEach(function (item) {
          targetArray.push(item);
        });
      }

      const uniqueCount = targetArray.reduce((countMap, str) => {
        const key = str.toLowerCase().replace(/\s+/g, "");
        countMap.set(key, (countMap.get(key) || 0) + 1);
        return countMap;
      }, new Map());

      const sortedUniqueCount = new Map(
        [...uniqueCount.entries()].sort((a, b) => b[1] - a[1])
      );

      const top9cuisines = [...sortedUniqueCount.keys()].slice(0, 10);
      const counts = top9cuisines.map((key) => sortedUniqueCount.get(key));

      let map = new Map();
      for (j = 0; j < top9cuisines.length; j++) {
        const count_rate = new Array(4).fill(0);
        for (let i = 0; i < json["cuisines"].length; i++) {
          let rate = json["rate"][i];
          let cuisines = json["cuisines"][i];
          cuisines = cuisines.split(", ");

          let cuisineExist = cuisines.some((cuisine) => {
            const cleanedCuisine = cuisine.toLowerCase().replace(/\s+/g, "");
            return cleanedCuisine == top9cuisines[j];
          });
          if (cuisineExist) {
            //////console.log("rate",rate.slice(0,3));
            let rate_float = parseFloat(rate.slice(0, 3));

            if (rate_float <= 3) {
              count_rate[0] += 1;
            } else if (rate_float > 3 && rate_float < 3.5) {
              count_rate[1] += 1;
            } else if (rate_float >= 3.5 && rate_float < 4) {
              count_rate[2] += 1;
            } else {
              count_rate[3] += 1;
            }
          }
        }
        map.set(top9cuisines[j], count_rate);
        //////console.log("count rate: ", count_rate);
      }

      //////console.log(map);
      // //console.log(map);

      const newMap = new Map([
        ["index 0", []],
        ["index 1", []],
        ["index 2", []],
        ["index 3", []],
      ]);
      //////console.log("---------------------------",newMap);

      for (const [key, arr] of map) {
        for (let i = 0; i < arr.length; i++) {
          newMap.get(`index ${i}`).push(arr[i]);
        }
      }
      // //console.log(newMap.get("index0"));
      var dom = document.getElementById("bar-container");
      var myChart = echarts.init(dom, null, {
        renderer: "canvas",
        useDirtyRect: false,
      });
      var app = {};

      var option;

      option = {
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },
          //   formatter: function(params) {
          //     var data = params[0].data; // Get the original data for the hovered bar
          //     var list = new Array(3).fill(0);
          //     var x = 10; // Value of additional variable
          //     return 'Value: ' + list[0] + '<br>' + list[1]+ '<br>' + 'X: ' + x;
          // }
        },
        legend: {},
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        xAxis: [
          {
            type: "category",
            data: top9cuisines,
            name: "Top 10 Cuisines",
            nameLocation: "middle",
            nameTextStyle: {
              fontWeight: "bold",
            },
            nameGap: 26,
          },
        ],
        yAxis: [
          {
            type: "value",
            name: "Number of Restaurants",
            nameLocation: "middle",
            nameTextStyle: {
              fontWeight: "bold",
            },
            nameGap: 46,
          },
        ],
        series: [
          {
            name: " Rating: < 3",
            type: "bar",
            stack: "Ad",
            label: {
              show: true,
              position: "inside",
            },
            emphasis: {
              focus: "series",
            },
            data: newMap.get("index 0"),
          },
          {
            name: "Rating: 3-3.5",
            type: "bar",
            stack: "Ad",
            label: { show: true },
            emphasis: {
              focus: "series",
            },
            data: newMap.get("index 1"),
          },
          {
            name: "Rating: 3.5-4",
            type: "bar",
            stack: "Ad",
            label: { show: true },
            emphasis: {
              focus: "series",
            },
            data: newMap.get("index 2"),
          },
          {
            name: "Rating: > 4",
            type: "bar",
            stack: "Ad",
            label: { show: true },
            emphasis: {
              focus: "series",
            },
            data: newMap.get("index 3"),
          },
        ],
      };

      if (option && typeof option === "object") {
        myChart.setOption(option);
      }

      window.addEventListener("resize", myChart.resize);
    });
    // LINE CHART
    d3.csv("./data/downsampled_zomato.csv").then(function (data) {
      var json = {};

      data.forEach(function (d) {
        Object.keys(d).forEach(function (key) {
          if (!json[key]) {
            json[key] = [];
          }
          json[key].push(d[key]);
        });
      });

      cuisines = json["cuisines"];
      let targetArray = [];
      ////console.log(cuisines[0]);
      for (let i = 0; i < cuisines.length; i++) {
        let arr = cuisines[i].split(", ");

        arr.forEach(function (item) {
          targetArray.push(item);
        });
      }

      const uniqueCount = targetArray.reduce((countMap, str) => {
        const key = str.toLowerCase().replace(/\s+/g, "");
        countMap.set(key, (countMap.get(key) || 0) + 1);
        return countMap;
      }, new Map());

      const sortedUniqueCount = new Map(
        [...uniqueCount.entries()].sort((a, b) => b[1] - a[1])
      );

      const top10cuisines = [...sortedUniqueCount.keys()].slice(0, 10);
      const counts = top10cuisines.map((key) => sortedUniqueCount.get(key));
      //console.log(top10cuisines);
      let map = new Map();

      for (j = 0; j < top10cuisines.length; j++) {
        const avg_cost_list = new Array(4).fill(0);
        const avg_count_list = new Array(4).fill(0);

        for (let i = 0; i < json["cuisines"].length; i++) {
          let avg_cost = json["approx_cost(for two people)"][i];
          let rate = json["rate"][i];
          let cuisines = json["cuisines"][i];
          cuisines = cuisines.split(", ");

          let cuisineExist = cuisines.some((cuisine) => {
            const cleanedCuisine = cuisine.toLowerCase().replace(/\s+/g, "");
            return cleanedCuisine == top10cuisines[j];
          });

          if (cuisineExist) {
            ////console.log("rate",rate.slice(0,3));
            let rate_float = parseFloat(rate.slice(0, 3));

            if (rate_float <= 3) {
              if (!isNaN(parseFloat(avg_cost))) {
                avg_cost_list[0] += parseInt(avg_cost);
                avg_count_list[0] += 1;
              }
            } else if (rate_float > 3 && rate_float < 3.5) {
              if (!isNaN(parseFloat(avg_cost))) {
                avg_cost_list[1] += parseInt(avg_cost);
                avg_count_list[1] += 1;
              }
            } else if (rate_float >= 3.5 && rate_float < 4) {
              if (!isNaN(parseFloat(avg_cost))) {
                avg_cost_list[2] += parseInt(avg_cost);
                avg_count_list[2] += 1;
              }
            } else {
              if (!isNaN(parseFloat(avg_cost))) {
                avg_cost_list[3] += parseInt(avg_cost);
                avg_count_list[3] += 1;
              }
            }
          }
        }
        avg_cost_list[0] = (avg_cost_list[0] / avg_count_list[0]).toFixed(1);
        avg_cost_list[1] = (avg_cost_list[1] / avg_count_list[1]).toFixed(1);
        avg_cost_list[2] = (avg_cost_list[2] / avg_count_list[2]).toFixed(1);
        avg_cost_list[3] = (avg_cost_list[3] / avg_count_list[3]).toFixed(1);
        map.set(top10cuisines[j], avg_cost_list);

        ////console.log("count rate: ", count_rate);
      }
      //console.log("map: ", map);

      const newMap = new Map([
        ["index 0", []],
        ["index 1", []],
        ["index 2", []],
        ["index 3", []],
      ]);
      ////console.log("---------------------------",newMap);

      for (const [key, arr] of map) {
        for (let i = 0; i < arr.length; i++) {
          newMap.get(`index ${i}`).push(arr[i]);
        }
      }

      var dom = document.getElementById("line-container");
      var myChart = echarts.init(dom, null, {
        renderer: "canvas",
        useDirtyRect: false,
      });
      var app = {};

      var option;

      option = {
        title: {
          text: "Stacked Line",
        },
        tooltip: {
          trigger: "axis",
        },
        legend: {
          data: [
            "Rating: < 3",
            "Rating: 3-3.5",
            "Rating: 3.5-4",
            "Rating: > 4",
          ],
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        toolbox: {
          feature: {
            saveAsImage: {},
          },
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: top10cuisines,
          name: "Top 10 Cuisines",
          nameLocation: "middle",
          nameTextStyle: {
            fontWeight: "bold",
          },
          nameGap: 26,
        },
        yAxis: {
          type: "value",
          axisLabel: {
            formatter: function (value) {
              return ""; // set the formatter to an empty string to hide the tick values
            },
          },
          axisLine: {
            show: true, // show axis line
          },
          name: "Approximate cost for 2 people",
          nameLocation: "middle",
          nameTextStyle: {
            fontWeight: "bold",
          },
          nameGap: 26,
        },
        series: [
          {
            name: "Rating: < 3",
            type: "line",
            stack: "Total",
            data: newMap.get("index 0"),
          },
          {
            name: "Rating: 3-3.5",
            type: "line",
            stack: "Total",
            data: newMap.get("index 1"),
          },
          {
            name: "Rating: 3.5-4",
            type: "line",
            stack: "Total",
            data: newMap.get("index 2"),
          },
          {
            name: "Rating: > 4",
            type: "line",
            stack: "Total",
            data: newMap.get("index 3"),
          },
        ],
      };

      if (option && typeof option === "object") {
        myChart.setOption(option);
      }

      window.addEventListener("resize", myChart.resize);
    });
  }

  if (category == "business" && subcategory == "already") {
    home.style.display = "none";
    chart.style.display = "block";
    title.innerHTML = "Comparison based Performance Analysis";
    pieLabel.style.display = "block";
    gridLabel.style.display = "block";

    var bar = document.getElementById("bar-container");
    bar.style.display = "none";
    var line = document.getElementById("line-container");
    line.style.display = "none";
    var tree = document.getElementById("tree-container");
    tree.style.display = "none";

    var pie = document.getElementById("pie-container");
    pie.style.display = "block";
    pie.style.height = "84vh";
    pie.style.width = "90%";

    pieLabel.innerHTML =
      "*Average Rating of each section is written on the donut chart";

    var grid = document.getElementById("grid-container");
    grid.style.display = "block";
    grid.style.height = "84vh";
    grid.style.width = "90%";

    gridLabel.innerHTML =
      "*Select count of dishes liked served by better performing similar restaurants";

    var cCategory = document.getElementById("c-category");
    document.getElementById("c-options").style.display = "block";
    // PIE CHART
    d3.csv("./data/downsampled_zomato.csv").then(function (data) {
      var json = {};
      data.forEach(function (d) {
        Object.keys(d).forEach(function (key) {
          if (!json[key]) {
            json[key] = [];
          }
          json[key].push(d[key]);
        });
      });
      let fix_cuisine = "mughlai"; // should be variable.. hardcoded now.
      let coptions = [];
      for (let i = 0; i < json["cuisines"].length; i++) {
        let list_cuisine = json["cuisines"][i].split(",");
        let cuisineExist = list_cuisine.some((cuisine) => {
          const cleanedCuisine = cuisine.toLowerCase().replace(/\s+/g, "");
          let pattern = /^[a-zA-Z]+$/;
          if (pattern.test(cleanedCuisine) && cleanedCuisine.length < 30) {
            coptions.push(cleanedCuisine);
          }
        });
      }
      coptions = Array.from(new Set(coptions));
      for (var i = 0; i < coptions.length; i++) {
        var option = document.createElement("option");
        option.text = coptions[i];
        option.value = coptions[i]; // Set the value attribute of the option to the index of the option
        cCategory.appendChild(option);
      }
      fix_cuisine = cCategory.value;
      //   online - book table
      let YY = 0;
      let YN = 0;
      let NY = 0;
      let NN = 0;
      let ratingYY = 0.0;
      let ratingYN = 0.0;
      let ratingNY = 0.0;
      let ratingNN = 0.0;

      for (let i = 0; i < json["cuisines"].length; i++) {
        let list_cuisine = json["cuisines"][i].split(",");
        let cuisineExist = list_cuisine.some((cuisine) => {
          const cleanedCuisine = cuisine.toLowerCase().replace(/\s+/g, "");
          return cleanedCuisine == fix_cuisine;
        });

        if (cuisineExist) {
          //////console.log("i: ",i);
          // //////console.log(typeof json["online_order"][i]);
          if (
            json["online_order"][i].toLowerCase() == "yes" &&
            json["book_table"][i].toLowerCase() == "yes"
          ) {
            YY += 1;
            if (!isNaN(parseFloat(json["rate"][i].slice(0, 3)))) {
              ratingYY += parseFloat(json["rate"][i].slice(0, 3));
            }
          } else if (
            json["online_order"][i].toLowerCase() == "yes" &&
            json["book_table"][i].toLowerCase() == "no"
          ) {
            YN += 1;
            if (!isNaN(parseFloat(json["rate"][i].slice(0, 3)))) {
              ratingYN += parseFloat(json["rate"][i].slice(0, 3));
            }
          } else if (
            json["online_order"][i].toLowerCase() == "no" &&
            json["book_table"][i].toLowerCase() == "yes"
          ) {
            NY += 1;
            if (!isNaN(parseFloat(json["rate"][i].slice(0, 3)))) {
              ratingNY += parseFloat(json["rate"][i].slice(0, 3));
            }
          } else {
            NN += 1;
            if (!isNaN(parseFloat(json["rate"][i].slice(0, 3)))) {
              ratingNN += parseFloat(json["rate"][i].slice(0, 3));
            }
            // ratingNN += parseFloat(json['rate'][i].slice(0,3))
          }
        }
      }
      //////console.log("YY, YN, NY, NN", ratingYY,ratingYN,ratingNY,ratingNN);

      var dom = document.getElementById("pie-container");
      var myChart = echarts.init(dom, null, {
        renderer: "canvas",
        useDirtyRect: false,
      });
      var app = {};

      var option;

      option = {
        tooltip: {
          trigger: "item",
        },
        legend: {
          top: "5%",
          left: "center",
        },
        series: [
          {
            name: "Access From",
            type: "pie",
            radius: ["40%", "70%"],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: "#fff",
              borderWidth: 2,
            },
            label: {
              show: true,
              position: "inside",
              fontSize: 15,
              fontWeight: "bold",
              color: "#fff",
            },
            emphasis: {
              label: {
                show: false,
                fontSize: 10,
                fontWeight: "bold",
              },
            },
            labelLine: {
              show: false,
            },
            data: [
              {
                value: YY,
                name: "Accepting Online-order & Book-table                                                                                          ",
                label: { formatter: (ratingYY / YY).toFixed(1).toString() },
              },
              {
                value: YN,
                name: "Accepting Online-order",
                label: { formatter: (ratingYN / YN).toFixed(1).toString() },
              },
              {
                value: NY,
                name: "Accepting Book-table                                                                                                      ",
                label: { formatter: (ratingNY / NY).toFixed(1).toString() },
              },
              {
                value: NN,
                name: "Dine-in Only",
                label: { formatter: (ratingNN / NN).toFixed(1).toString() },
              },
            ],
          },
        ],
      };

      if (option && typeof option === "object") {
        myChart.setOption(option);
      }

      window.addEventListener("resize", myChart.resize);
    });

    // GRID CHART
    d3.csv("./data/downsampled_zomato.csv").then(function (json_data) {
      var json = {};
      json_data.forEach(function (d) {
        Object.keys(d).forEach(function (key) {
          if (!json[key]) {
            json[key] = [];
          }
          json[key].push(d[key]);
        });
      });

      let fix_cuisine = "desserts"; // should be variable.. hardcoded now.
      let fix_rate = 2.6; // should be variable.. hardcoded now.

      var rCategory = document.getElementById("r-category");
      for (var i = 1; i <= 50; i++) {
        var option = document.createElement("option");
        var optionValue = (i / 10).toFixed(1); // Generate the option value
        option.text = optionValue.toString();
        option.value = optionValue;
        rCategory.appendChild(option); // Add the option to the dropdown
      }
      fix_cuisine = cCategory.value;
      fix_rate = rCategory.value;
      let targetArray = [];
      let count = 0;
      for (let i = 0; i < json["cuisines"].length; i++) {
        if (json["menu_item"][i] == []) {
          count += 1;
        }
        let list_cuisine = json["cuisines"][i].split(",");

        let cuisineExist = list_cuisine.some((cuisine) => {
          const cleanedCuisine = cuisine.toLowerCase().replace(/\s+/g, "");
          return cleanedCuisine == fix_cuisine;
        });

        if (cuisineExist) {
          if (parseFloat(json["rate"][i].slice(0, 3)) > fix_rate) {
            let arr = json["dish_liked"][i].split(", ");

            arr.forEach(function (item) {
              targetArray.push(item);
            });
          }
        }
      }
      //////console.log("--------------------------", targetArray);
      const frequencyMap = targetArray.reduce((map, val) => {
        const key = val.toLowerCase().replace(/\s+/g, "");
        map[key] = (map[key] || 0) + 1;
        return map;
      }, {});

      delete frequencyMap[""];
      //////console.log("frequenct map",frequencyMap);
      const mapSize = Object.keys(frequencyMap).length;

      let final_freq_map = new Map();

      if (mapSize <= 225) {
        // pick all key-value pairs
        //////console.log("actually less that");
        final_freq_map = frequencyMap;

        // //////console.log(allKeyValuePairs);
      } else {
        const keys = Object.keys(frequencyMap);
        const randomKeys = [];

        while (Object.keys(final_freq_map).length < 225) {
          const randomIndex = Math.floor(Math.random() * mapSize);
          const randomKey = keys[randomIndex];
          final_freq_map[randomKey] = frequencyMap[randomKey];
        }
      }
      //////console.log("final mapping::::::", final_freq_map);
      const keys = Object.keys(frequencyMap);
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      //   //////console.log("rand", randomKey);

      var dom = document.getElementById("grid-container");
      var myChart = echarts.init(dom, null, {
        renderer: "canvas",
        useDirtyRect: false,
      });
      var app = {};

      var option;

      const hours = [
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
        "13",
        "14",
        "15",
      ];
      const days = [
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
        "13",
        "14",
        "15",
      ];

      const data = [];
      const final_freq_map_values = Object.values(final_freq_map);
      let final_freq_map_keys = Object.keys(final_freq_map).sort();
      //////console.log("keys", final_freq_map_keys.sort());
      let key_ind = 0;
      for (let i = 0; i < 15; i++) {
        // loop over the columns
        for (let j = 0; j < 15; j++) {
          if (Object.keys(final_freq_map).length <= 0) {
            //////console.log("empty map");
            break;
          }

          const randomKey = final_freq_map_keys[key_ind++];

          const randomValue = final_freq_map[randomKey];
          const cellName = randomKey;
          const value = randomValue;
          const obj = { name: cellName, value: [j, i, value] };
          data.push(obj);
          delete final_freq_map[randomKey];
        }
      }
      key_ind = 0;
      //////console.log("data: ",data[7]);
      option = {
        tooltip: {
          position: "top",
        },
        grid: {
          height: "70%",
          top: "10%",
        },
        xAxis: {
          type: "category",
          data: hours,
          splitArea: {
            show: true,
          },
        },
        yAxis: {
          type: "category",
          data: days,
          splitArea: {
            show: true,
          },
        },
        visualMap: {
          min: Math.min(...final_freq_map_values),
          max: Math.max(...final_freq_map_values) / 3,
          calculable: true,
          orient: "horizontal",
          left: "center",
          bottom: "5%",
          width: "100%",
          itemHeight: "380%",
        },
        series: [
          {
            type: "heatmap",
            data: data,
            label: {
              show: true,
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowColor: "rgba(0, 0, 0, 0.5)",
              },
            },
          },
        ],
      };

      if (option && typeof option === "object") {
        myChart.setOption(option);
      }

      window.addEventListener("resize", myChart.resize);
    });
  }
}
