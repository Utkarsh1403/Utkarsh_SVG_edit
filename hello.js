// //const readfile = () => {
//     let upload = document.getElementById('upload');
//     upload.addEventListener('change', ()=>{

//         let fr = new FileReader();
//         fr.readAsText(upload.files[0]);
//         fr.onload = function(){
//             outputBx.innerHTML = fr.result;
//             //     console.log(fr.result);
                
//             let SVG = outputBx.querySelector('g');    
//             //SVG = SVG.toString();
//             //console.log('---------------');
//             console.log(SVG);
//             //console.log('---------------');
//             // let SVG1 = SVG.toString();

//             // console.log(SVG1);
//             // console.log(SVG1);
//             const s = new XMLSerializer() .serializeToString(SVG);
//             const encodedData = window.btoa(s)
//             console.log(encodedData);


//             var svgData = localStorage.setItem("Key1",encodedData);
//             //    console.log(svgData);
//             var svgData1 =localStorage.getItem("Key1");
//             let dec = window.atob(svgData1)
//             console.log(dec);
//             outputBx.innerHTML = dec;


//         //     // let outputBx = document.getElementById('outputBx');


//         }   
//     })
// //}
// //let SVG = outputBx.querySelector('g');     

// // const addItem = () => {
// //     const div = document.createElement("div");
// //     div.className = "container_map";
// //     div.id = "map"

// //     // let outputBx = document.getElementById('outputBx');
    
// //     if (itemsContainer.children.length % 4 === 0)
// //       columns++;
    
// //     itemsContainer.append(div);
// //     }



// // document.querySelector("#upload").addEventListener("change", function(){
// //     const reader = new FileReader();

// //     reader.addEventListener("load", () => {
// //         localStorage.setItem("recent-image", reader.result);
// //     });

// //     reader.readAsDataURL(this.files[0]);
// // });

// // document.addEventListener("DOMContentLoaded", () => {
// //     const recentImageDataUrl = localStorage.getItem("recent-image");

// //     if(recentImageDataUrl){
// //         document.querySelector("#imgPreview").setAttribute("src", recentImageDataUrl);
// //     }
// // });