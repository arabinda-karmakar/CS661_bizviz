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

  //   console.log("json: ", json);

  const uniqueCount = json["location"].reduce((countMap, str) => {
    const key = str.toLowerCase().replace(/\s+/g, "");
    countMap.set(key, (countMap.get(key) || 0) + 1);
    return countMap;
  }, new Map());

  const sortedUniqueCount = new Map(
    [...uniqueCount.entries()].sort((a, b) => b[1] - a[1])
  );
  const top10location = [...sortedUniqueCount.keys()].slice(0, 5);
  //   console.log("10rest: ", top10location);

  let location_wise_cuisines = new Map();
  for (let i = 0; i < 5; i++) {
    //location
    // console.log("1st loop");
    let pick_location = top10location[i];
    let temp = [];

    for (let j = 0; j < json["cuisines"].length; j++) {
      // cuisines
      if (
        pick_location == json["location"][j].toLowerCase().replace(/\s+/g, "")
      ) {
        // console.log("if condition");
        let list_cuisine = json["cuisines"][j].split(",");
        list_cuisine.forEach((cuisine) => {
          const cleanedCuisine = cuisine.toLowerCase().replace(/\s+/g, "");
          temp.push(cleanedCuisine);
        });
      }
    }
    // console.log("temp: ", temp);
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
          json["location"][k].toLowerCase().replace(/\s+/g, "") == pick_location
        ) {
          if (!isNaN(parseFloat(json["votes"][k])))
            res_name[json["name"][k]] = parseFloat(json["votes"][k]);
        }
      }
      //   console.log("res name: ",res_name);
      const top5rest = Object.entries(res_name)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

    //   console.log("top 5 rest: ", top5rest);
      pick_loca_dict[top5cuisines[j]] = top5rest;
    }
    location_wise_cuisines[pick_location] = pick_loca_dict;
  }

  //// finding location based on cuisine on a location

  var dom = document.getElementById("task3");
  var myChart = echarts.init(dom, null, {
    renderer: "canvas",
    useDirtyRect: false,
  });
  var app = {};
//   console.log('location wise cuisine', location_wise_cuisines)
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
    restaurant_keys_forcuisine = Object.keys(location_wise_cuisines[top10location[x]][nameofcusine[y]]);
    // console.log(location_wise_cuisines[top10location[x]][nameofcusine[y]])
    // console.log(restaurant_keys_forcuisine.length, 'key length');
    valt =[];
        for(let r=0; r<restaurant_keys_forcuisine.length; r++){
            let dictr = new Map();
            dictr['name'] = restaurant_keys_forcuisine[r];
            dictr['value'] = location_wise_cuisines[top10location[x]][nameofcusine[y]][restaurant_keys_forcuisine[r]];
            valt.push(dictr)
        }
        dicty['children'] = valt; 
      val_arr.push(dicty);
    }
    dictx["children"] = val_arr;
    tempc.push(dictx);
  }
  data1["children"] = tempc;
//   console.log("data 1 value is", data1);

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
        tooltip:{crossStyle:{
            width: 45
        }},
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
