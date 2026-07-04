const bus_container = document.querySelector(".bus_container");
const time = document.querySelector(".time")
const date = document.querySelector(".date")
const icon_container = document.querySelector(".icon")
const api_key = "3de6a34a9eea7ffea7fd499456868914";
const city_name = "Sheung Shui";
let route_list = ["273A","270B","978"];

const fare_map = {
    "273A" : 5.1,
    "270B" : 16.9,
    "978" : 7.7,

}
const MAX_SIZE  = 2 ;
let current_idx = 0 ;

function checkOrientation(){

    if(window.innerHeight > window.innerWidth){

        document.querySelector(".container").style.display = "none";

        document.body.insertAdjacentHTML(
            "beforeend",
            '<h1 id="rotate">Please rotate device</h1>'
        );

    }
    else{
        document.querySelector(".container").style.display = "block";
    }
}



// const curr = new Date();

// if (curr.getHours() > 18 || curr.getHours() < 6){
//     document.body.classList.add("dark_mode");
// }
// else{
//     document.body.classList.remove("dark_mode");
// }


async function refresh_time(){

    const curr = new Date();

    const hr = curr.getHours().toString().padStart(2,0);
    const mins = curr.getMinutes().toString().padStart(2,0);
    const sec = curr.getSeconds().toString().padStart(2,0);

    // console.log(`${hr}:${mins}:${sec}`);
    // console.log(curr.getDay());
    // console.log(curr.getDate());
    // console.log(curr.getMonth()+1);
    // console.log(curr.getFullYear());

    const weekdays = [             
                    "星期日",
                    "星期一",
                    "星期二",
                    "星期三",
                    "星期四",
                    "星期五",
                    "星期六"
    ];

    const day = weekdays[curr.getDay()];

    time.innerHTML = `${hr}:${mins}:${sec}`;

    date.innerHTML = `${day} | ${curr.getDate()}/${curr.getMonth()+1},${curr.getFullYear()}`;

}

async function refresh_bus(){

    const stop_id = "CF94083CB24CF4E5";         // Cheung Lung Wai

    // const target_route = bus_chose.value;

    bus_container.innerHTML = "";


    const results = await Promise.all(
        route_list.map(async route=>{
            const url = `https://data.etabus.gov.hk/v1/transport/kmb/eta/${stop_id}/${route}/1`;

            const response = await fetch(url);
    
            const data = await response.json() ;

            return {
                route,data
            };
        })
    )

    for (const result of results){

        const route = result.route;
        const data = result.data;

        // console.log(data);

        const card = document.createElement("div");
        card.classList.add("bus_card");
        bus_container.appendChild(card);
        

        const title = document.createElement("div");
        title.innerHTML = `<div class="bus_title">
                            <h3>${route}</h3>
                            <p>往${data.data[0].dest_tc}</p>
                            <p class= "fee">車費 : $${fare_map[route]}</p>
                            </div>` ;
        title.classList.add("bus_left");
        card.appendChild(title);
        

        const info = document.createElement("div");
        info.classList.add("bus_info");
        card.appendChild(info);

        
        for (let i = 0 ; i < Math.min(2 , data.data.length) ; i++){

            const eta = data.data[i].eta;


            if (!eta){
                
                const text = document.createElement('div');
                text.classList.add("mins_show");
                text.textContent = "暫停服務!";
        
                info.appendChild(text);
                
            }

            else{
    
                // const arrival_text = document.createElement('p');
                // arrival_text.textContent = "到達祥龍圍";
                // info.append(arrival_text);

                const s_eta = new Date(eta);
                const curr = new Date();
                const remain = Math.round((s_eta - curr)/(1000*60));
    
                const text = document.createElement('div');
                text.innerHTML = `${remain <= 0? '即將到站' : `<p class="mins_show">${remain}<p> mins`}`;
        
                info.appendChild(text);
            
            }
        }
    
    }

}

async function refresh_weather(){


    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city_name}&appid=${api_key}&units=metric&lang=zh_tw`;

    const response = await fetch(url);
    
    const data = await response.json();
    // console.log(data);
    
    const humidity = data.main.humidity.toFixed(1);
    let temp = data.main.temp.toFixed(1);
    const icon = data.weather[0].icon;
    const desc = data.weather[0].description;
    // console.log(desc);
    

    const icon_url =`https://openweathermap.org/img/wn/${icon}@2x.png`;

    const icon_img = document.createElement("img")
    icon_container.innerHTML = "";
    icon_img.src = icon_url;
    icon_container.appendChild(icon_img);

    const deg = document.querySelector(".deg");
    deg.innerHTML = "";
    deg.innerHTML = `${temp}&deg;C`;

    const description = document.querySelector(".description");
    description.innerHTML = "";
    description.innerHTML = `${desc}`;

    const hum = document.querySelector(".hum");
    hum.innerHTML = "";
    hum.innerHTML = `濕度 : ${humidity}%`;




}

checkOrientation();
refresh_time();
refresh_bus();
refresh_weather();
setInterval(refresh_bus , 10000);
setInterval(refresh_time , 1000);
setInterval(refresh_weather, 300000);



if ("serviceWorker" in navigator){

    navigator.serviceWorker
        .register("./service-worker.js")
        .then(() => {
            console.log("SW Ready");
        });

}