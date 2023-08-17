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
  //console.log(cuisines[0]);
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
  console.log(top10cuisines);
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
        //console.log("rate",rate.slice(0,3));
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
    avg_cost_list[0] = (avg_cost_list[0]/ avg_count_list[0]).toFixed(1);
    avg_cost_list[1] = (avg_cost_list[1]/ avg_count_list[1]).toFixed(1);
    avg_cost_list[2] = (avg_cost_list[2]/ avg_count_list[2]).toFixed(1);
    avg_cost_list[3] = (avg_cost_list[3]/ avg_count_list[3]).toFixed(1);
    map.set(top10cuisines[j], avg_cost_list);

    //console.log("count rate: ", count_rate);
  }
  console.log("map: ", map);

  const newMap = new Map([
    ["index 0", []],
    ["index 1", []],
    ["index 2", []],
    ["index 3", []],
  ]);
  //console.log("---------------------------",newMap);

  for (const [key, arr] of map) {
    for (let i = 0; i < arr.length; i++) {
      newMap.get(`index ${i}`).push(arr[i]);
    }
  }



  var dom = document.getElementById("line");
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
      data: ["Rating: < 3", "Rating: 3-3.5", "Rating: 3.5-4", "Rating: > 4"],
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
            nameLocation: 'middle', 
            nameTextStyle: {
              fontWeight: 'bold' 
          },
          nameGap: 26
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: function(value) {
            return ''; // set the formatter to an empty string to hide the tick values
        }
    },
    axisLine: {
        show: true // show axis line
    },
      name: "Approximate cost for 2 people",
            nameLocation: 'middle', 
            nameTextStyle: {
              fontWeight: 'bold' 
          },
          nameGap: 26
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
