const API = "https://hotel-management-e3zu.onrender.com";
//const API = "http://localhost:3000";

/* ---------------- GLOBAL ---------------- */

let calculatedPrice = null

/* ---------------- PAGINATION ---------------- */

let hotelPage = 1;
let roomTypePage = 1;
let roomPage = 1;
let bookingPage = 1;

const limit = 5;

let totalHotelPages = 1;
let totalRoomTypePages = 1;
let totalRoomPages = 1;
let totalBookingPages = 1;

let hotelSearch = "";
let roomTypeSearch = "";
let roomSearch = "";
let bookingSearch = "";

const role = localStorage.getItem("role");
console.log("ROLE VALUE:", role);
console.log("PATH:", window.location.pathname);

if (window.location.pathname.includes("admin.html") && role !== "ADMIN") {
  alert("Access denied");
  window.location.href = "user.html";
}
/* ---------------- AUTH ---------------- */

async function signup(){
  console.log("signup called")

  const name = document.getElementById("signupName").value
  const email = document.getElementById("signupEmail").value
  const password = document.getElementById("signupPassword").value

  if(!name || !email || !password){
    alert("Please fill all fields")
    return
  }

  try {
    const res = await fetch(`${API}/auth/signup`, {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      credentials: "include",
      body: JSON.stringify({ name, email, password })
    })

    const data = await res.json()

    if(!res.ok){
      alert(data.message || "Signup failed")
      return
    }

    alert("Signup successful")

    document.getElementById("signupName").value = "";
    document.getElementBysId("signupEmail").value = "";
    document.getElementById("signupPassword").value = "";

  } catch(err){
    alert("Server error")
  }
}


async function login() {
  console.log("login called");

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    alert("Please enter both email and password");
    return;
  }

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    console.log("Response status:", res.status);
    const data = await res.json();
    console.log(data);

    if (res.ok) {

      // store role
      localStorage.setItem("role", data.role);
      localStorage.setItem("email", data.email); // store email
      localStorage.setItem("name", data.name);

      // redirect based on role
      if (data.role === "ADMIN") {
        window.location.href = "admin.html";
      } else {
        window.location.href = "user.html";
      }

      // clear login fields
      document.getElementById("loginEmail").value = "";
      document.getElementById("loginPassword").value = "";

    } else {
      alert(data.message || "Login failed");
    }

  } catch (err) {
    console.error("Error:", err);
    alert("Server error");
  }
}

/* ---------------- HOTEL ---------------- */

async function loadHotels(){

const res = await fetch(`${API}/hotel?page=${hotelPage}&limit=${limit}&search=${hotelSearch}`)
const result = await res.json()

const hotels = result.data
totalHotelPages = result.totalPages

const table = document.getElementById("hotelTable")
table.innerHTML = ""

hotels.forEach(h=>{
table.innerHTML += `
<tr>
<td>${h.id}</td>
<td>${h.name}</td>
<td>${h.location}</td>
</tr>
`
})

document.getElementById("hotelPageInfo").innerText =
`Page ${hotelPage} of ${totalHotelPages}`

}

function searchHotels(){
hotelSearch = document.getElementById("hotelSearch").value
hotelPage = 1
loadHotels()
}

function nextHotel(){
if(hotelPage < totalHotelPages){
hotelPage++
loadHotels()
}
}

function prevHotel(){
if(hotelPage > 1){
hotelPage--
loadHotels()
}
}

async function createHotel(){

const name = document.getElementById("hotelName").value
const location = document.getElementById("hotelLocation").value

await fetch(`${API}/hotel`,{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({name,location})
})

alert("Hotel Created")

document.getElementById("hotelName").value=""
document.getElementById("hotelLocation").value=""

loadHotels()

}


/* ---------------- ROOM TYPE ---------------- */

async function loadRoomTypes(){

const res = await fetch(`${API}/room-type?page=${roomTypePage}&limit=${limit}&search=${roomTypeSearch}`)
const result = await res.json()

const types = result.data
totalRoomTypePages = result.totalPages

const table = document.getElementById("roomTypeTable")
table.innerHTML=""

types.forEach(rt=>{
table.innerHTML += `
<tr>
<td>${rt.id}</td>
<td>${rt.name}</td>
<td>${rt.basePrice}</td>
<td>${rt.maxOccupancy}</td>
<td>${rt.pricingStrategy}</td>
</tr>
`
})

document.getElementById("roomTypePageInfo").innerText =
`Page ${roomTypePage} of ${totalRoomTypePages}`

}

function searchRoomTypes(){
roomTypeSearch = document.getElementById("roomTypeSearch").value
roomTypePage = 1
loadRoomTypes()
}

function nextRoomType(){
if(roomTypePage < totalRoomTypePages){
roomTypePage++
loadRoomTypes()
}
}

function prevRoomType(){
if(roomTypePage > 1){
roomTypePage--
loadRoomTypes()
}
}

async function createRoomType(){

const name = document.getElementById("roomTypeName").value
const basePrice = document.getElementById("roomPrice").value
const maxOccupancy = document.getElementById("maxOccupancy").value
const pricingStrategy = document.getElementById("strategy").value

await fetch(`${API}/room-type`,{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
name,
basePrice:Number(basePrice),
maxOccupancy:Number(maxOccupancy),
pricingStrategy
})
})

alert("Room Type Created")

document.getElementById("roomTypeName").value=""
document.getElementById("roomPrice").value=""
document.getElementById("maxOccupancy").value=""
document.getElementById("strategy").value=""

loadRoomTypes()

}


/* ---------------- ROOM ---------------- */

async function loadRooms(){

const res = await fetch(`${API}/room?page=${roomPage}&limit=${limit}&search=${roomSearch}`)
const result = await res.json()

const rooms = result.data
totalRoomPages = result.totalPages

const table = document.getElementById("roomTable")
table.innerHTML=""

rooms.forEach(r=>{
table.innerHTML += `
<tr>
<td>${r.id}</td>
<td>${r.roomNumber}</td>
<td>${r.floor}</td>
<td>${r.hotelId}</td>
<td>${r.roomTypeId}</td>
</tr>
`
})

document.getElementById("roomPageInfo").innerText =
`Page ${roomPage} of ${totalRoomPages}`

}

function searchRooms(){
roomSearch = document.getElementById("roomSearch").value
roomPage = 1
loadRooms()
}

function nextRoom(){
if(roomPage < totalRoomPages){
roomPage++
loadRooms()
}
}

function prevRoom(){
if(roomPage > 1){
roomPage--
loadRooms()
}
}


async function createRoom(){

  const roomNumber = document.getElementById("roomNumber").value
  const floor = document.getElementById("floor").value
  const hotelId = document.getElementById("roomHotelId").value
  const roomTypeId = document.getElementById("roomTypeId").value

  if(!roomNumber || !floor || !hotelId || !roomTypeId){
    alert("Please fill all fields")
    return
  }

  try {

    const res = await fetch(`${API}/room`,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        roomNumber: Number(roomNumber),
        floor: Number(floor),
        hotelId: Number(hotelId),
        roomTypeId: Number(roomTypeId)
      })
    })

    const data = await res.json()

    //HANDLE ERROR
    if(!res.ok){
      alert(data.error || "Room creation failed")
      return
    }

    //SUCCESS
    alert("Room Created Successfully")

    document.getElementById("roomNumber").value=""
    document.getElementById("floor").value=""
    document.getElementById("roomHotelId").value=""
    document.getElementById("roomTypeId").value=""

    loadRooms()

  } catch(err){
    alert("Server error. Please try again.")
  }
}


/* ---------------- ROOM TYPE DROPDOWN ---------------- */

async function loadRoomTypeDropdown(){

  const res = await fetch(`${API}/room-type?limit=100`)
  const result = await res.json()
  const types = result.data || result

  const dropdown = document.getElementById("bookingRoomTypeId")
  dropdown.innerHTML = `<option value="">Select Room Type</option>`

  // fetch rooms
  const roomRes = await fetch(`${API}/room?limit=100`)
  const roomResult = await roomRes.json()
  const rooms = roomResult.data || roomResult

  //handle BOTH formats
  const availableRoomTypeIds = new Set(
    rooms.map(r => r.roomTypeId || r.room_type_id)
  )

  // filter
  types.forEach(rt => {

    const id = rt.id

    if(availableRoomTypeIds.has(id)){
      dropdown.innerHTML += `
        <option value="${rt.id}">
          ${rt.name} (Max ${rt.maxOccupancy || rt.max_occupancy})
        </option>
      `
    }

  })

}

/* ---------------- BOOKING ---------------- */

async function loadBookings() {
  const role = localStorage.getItem("role");

  const url = role === "ADMIN"
    ? `${API}/booking?page=${bookingPage}&limit=${limit}&search=${bookingSearch}`
    : `${API}/booking/my?page=${bookingPage}&limit=${limit}`;

  const res = await fetch(url, {
    credentials: "include"
  });

  const result = await res.json();
  const bookings = result.data || [];
  totalBookingPages = result.totalPages || 1;

  const table = document.getElementById("bookingTable");
  table.innerHTML = "";

  if (bookings.length === 0) {
    table.innerHTML = `<tr><td colspan="8" style="text-align:center;">No bookings yet</td></tr>`;
    document.getElementById("bookingPageInfo").innerText = "";
    return;
  }

  bookings.forEach(b => {
    table.innerHTML += `
      <tr>
        <td>${b.id}</td>
        <td>${b.guest_name}</td>
        <td>${b.room_type_name}</td>
        <td>${new Date(b.check_in_date).toLocaleDateString()}</td>
        <td>${new Date(b.check_out_date).toLocaleDateString()}</td>
        <td>${b.total_cost}</td>
        <td>${b.status}</td>
        <td>${b.room_id ?? "-"}</td>
        <td>
          ${
            b.status === "INITIALIZED"
              ? `<button onclick="confirmBooking(${b.id})">Confirm</button>`
              : b.status === "CONFIRMED"
              ? `<button onclick="checkInBooking(${b.id})">Check-In</button>`
              : b.status === "CHECKED_IN"
              ? `<button onclick="checkOutBooking(${b.id})">Check-Out</button>`
              : b.status === "CHECKED_OUT"
              ? `<button onclick="completeBooking(${b.id})">Complete</button>`
              : ""
          }
        </td>
      </tr>
    `;
  });

  document.getElementById("bookingPageInfo").innerText =
    `Page ${bookingPage} of ${totalBookingPages}`;
}

//loading guest bookings

async function loadGuestBookings() {
  const email = document.getElementById("email").value;

  if (!email) return;

  const res = await fetch(`${API}/booking/guest?email=${email}`);
  const result = await res.json();

  const table = document.getElementById("bookingTable");
  table.innerHTML = "";

  result.data.forEach(b => {
    table.innerHTML += `
      <tr>
        <td>${b.id}</td>
        <td>${b.guest_name}</td>
        <td>${b.room_type_name}</td>
        <td>${new Date(b.check_in_date).toLocaleDateString()}</td>
        <td>${new Date(b.check_out_date).toLocaleDateString()}</td>
        <td>${b.total_cost}</td>
        <td>${b.status}</td>
        <td>${b.room_id ?? "-"}</td>
        <td>
          ${
            b.status === "INITIALIZED"
              ? `<button onclick="confirmBooking(${b.id})">Confirm</button>`
              : b.status === "CONFIRMED"
              ? `<button onclick="checkInBooking(${b.id})">Check-In</button>`
              : b.status === "CHECKED_IN"
              ? `<button onclick="checkOutBooking(${b.id})">Check-Out</button>`
              : b.status === "CHECKED_OUT"
              ? `<button onclick="completeBooking(${b.id})">Complete</button>`
              : ""
          }
        </td>
      </tr>
    `;
  });
}


function searchBookings(){
bookingSearch = document.getElementById("bookingSearch").value
bookingPage = 1
loadBookings()
}


function nextBooking(){
  if(bookingPage < totalBookingPages){
    bookingPage++
    loadBookings()
  }
}

function prevBooking(){
  if(bookingPage > 1){
    bookingPage--
    loadBookings()
  }
}


/* ---------------- BOOKING ACTIONS ---------------- */

async function confirmBooking(id){
  const res = await fetch(`${API}/booking/${id}/confirm`, { 
    method: "PATCH",
    credentials: "include"
  });

  const data = await res.json();
  console.log(data);

  if (data.emailStatus === "SUCCESS") {
    alert("Booking confirmed & email sent ✅");
  } else if (data.emailStatus === "FAILED") {
    alert("Booking confirmed but email failed ❌");
  }else {
    alert("Booking confirmed (no email available)");
  }

  loadBookings();
}
async function checkInBooking(id){
  await fetch(`${API}/booking/${id}/checkin`, {
     method: "PATCH",
     credentials: "include"
  })
  loadBookings()
}

async function checkOutBooking(id){
  await fetch(`${API}/booking/${id}/checkout`, { 
    method: "PATCH",
    credentials: "include" 

  })
  loadBookings()
}

async function completeBooking(id){
  const res = await fetch(`${API}/booking/${id}/complete`, { 
    method: "PATCH",
    credentials: "include" 
  });

  const data = await res.json();
  console.log(data);

  if (data.emailStatus === "SUCCESS") {
    alert("Booking completed & email sent ✅");
  } else if (data.emailStatus === "FAILED") {
    alert("Booking completed but email failed ❌");
  }else {
    alert("Booking confirmed (no email available)");
  }

  loadBookings();
}


/* ---------------- RESET PRICE ---------------- */

function resetPrice(){

calculatedPrice = null

document.getElementById("bookingPriceResult").innerText = ""

document.getElementById("createBookingBtn").disabled = true

}


/* ---------------- BOOKING PRICE ---------------- */

async function checkBookingPrice(){

  const roomTypeId = document.getElementById("bookingRoomTypeId").value
  const checkIn = document.getElementById("checkInDate").value
  const checkOut = document.getElementById("checkOutDate").value

  if(!roomTypeId || !checkIn || !checkOut){
    alert("Please select Room Type and dates")
    return
  }

  try {

    const res = await fetch(`${API}/pricing/calculate`, {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        roomTypeId:Number(roomTypeId),
        checkInDate:checkIn,
        checkOutDate:checkOut
      })
    })

    const result = await res.json()

    if(!res.ok){
      alert(result.error || "Price calculation failed")
      return
    }

    calculatedPrice = result.totalPrice

    document.getElementById("bookingPriceResult").innerText =
      `Total Price: ${result.totalPrice}`

    document.getElementById("createBookingBtn").disabled = false

  } catch(err){
    alert("Server error. Please try again.")
  }
}

/* ---------------- CREATE BOOKING ---------------- */

async function createBooking(){

  if(calculatedPrice === null){
    alert("Please calculate price first")
    return
  }


  const guestName = document.getElementById("guestName").value
  const roomTypeId = document.getElementById("bookingRoomTypeId").value
  const checkIn = document.getElementById("checkInDate").value
  const checkOut = document.getElementById("checkOutDate").value
  const email = document.getElementById("email").value

  try {

     const isLoggedIn = localStorage.getItem("role");

       const url = isLoggedIn 
             ? `${API}/booking` 
             : `${API}/booking/guest`;

      const res = await fetch(url, {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           credentials: isLoggedIn ? "include" : "omit",
           body: JSON.stringify({
           guestName: guestName,
           roomTypeId: Number(roomTypeId),
           checkInDate: checkIn,
           checkOutDate: checkOut,
           email: email
         })
       });

    const data = await res.json()

    if(!res.ok){
      alert(data.error || "Booking failed")
      return
    }

    alert("Booking Created Successfully")

    document.getElementById("guestName").value=""
    document.getElementById("bookingRoomTypeId").value=""
    document.getElementById("checkInDate").value=""
    document.getElementById("checkOutDate").value=""
    document.getElementById("email").value = ""
    document.getElementById("bookingPriceResult").innerText=""

    document.getElementById("createBookingBtn").disabled=true

    calculatedPrice = null

    if (localStorage.getItem("role")) {
       loadBookings(); // user/admin
    } else {
       loadGuestBookings(); // guest
    }

  } catch(err){
    alert("Server error. Please try again.")
  }
}

function goToGuestBooking() {
  window.location.href = "guest-booking.html";
}
/* ---------------- INITIAL LOAD ---------------- */

// window.onload = () => {

// loadHotels()
// loadRoomTypes()
// loadRooms()
// loadBookings()
// loadRoomTypeDropdown()

// document.getElementById("createBookingBtn").disabled = true

// document.getElementById("bookingRoomTypeId").addEventListener("change", resetPrice)
// document.getElementById("checkInDate").addEventListener("change", resetPrice)
// document.getElementById("checkOutDate").addEventListener("change", resetPrice)

// }

function logout() {
  // Remove stored role
  localStorage.removeItem("role");

  // Optional: show alert
  alert("You have been logged out ✅");

  // Redirect to login/signup page
  window.location.href = "index.html";
}

window.onload = () => {

  if (document.getElementById("hotelTable")) loadHotels()
  if (document.getElementById("roomTypeTable")) loadRoomTypes()
  if (document.getElementById("roomTable")) loadRooms()
  //if (document.getElementById("bookingTable")) loadBookings() ---> before adding guest mode booking
  if (document.getElementById("bookingTable")) {
  if (localStorage.getItem("role")) {
     loadBookings(); // user/admin
    } else {
      const emailInput = document.getElementById("email");
      if (emailInput) {
         emailInput.addEventListener("change", loadGuestBookings);
        }
      }
    }

  if (document.getElementById("bookingRoomTypeId")) {
    loadRoomTypeDropdown()

    //  autofill name and email from localStorage
    const savedName = localStorage.getItem("name");
    const savedEmail = localStorage.getItem("email");

    if (savedName) document.getElementById("guestName").value = savedName;
    if (savedEmail) document.getElementById("email").value = savedEmail;

    const btn = document.getElementById("createBookingBtn")
    if (btn) btn.disabled = true

    const roomType = document.getElementById("bookingRoomTypeId")
    const checkIn = document.getElementById("checkInDate")
    const checkOut = document.getElementById("checkOutDate")

    if (roomType) roomType.addEventListener("change", resetPrice)
    if (checkIn) checkIn.addEventListener("change", resetPrice)
    if (checkOut) checkOut.addEventListener("change", resetPrice)
  }

}
