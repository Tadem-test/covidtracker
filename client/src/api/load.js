import axios from 'axios';

const url = 'https://covid19.mathdro.id/api';
const url2= 'http://localhost:5000/api';

 export const fetchDataToday = async (country) =>{
   //let changeableUrl = url2;
   
   //if(country){
     let changeableUrl = `${url2}/${country}/today`
   //}

  try {
    const {data}= await axios.get(changeableUrl);
    console.log(data);
    const modifiedData =data.map((today) => ({
      Date_reported: today.Date_reported,
      New_cases: today.New_cases,
      Cumulative_cases: today.Cumulative_cases,
      New_deaths: today.New_deaths,
      Cumulative_deaths: today.Cumulative_deaths,
    }))
    console.log(modifiedData)
    return modifiedData
  }catch(error){

  }
}


export const fetchDailyCountryData= async(country)=>{
  try{
    const {data} = await axios.get(`${url2}/${country}`);
    const modifiedData =data.map((countrydata) => ({
      Date_reported: countrydata.Date_reported,
      New_cases: countrydata.New_cases,
      Cumulative_cases: countrydata.Cumulative_cases,
      New_deaths: countrydata.New_deaths,
      Cumulative_deaths: countrydata.Cumulative_deaths,
    }))
  return modifiedData

  } catch(error){


  }
}

export const fetchCountries = async()=>{
  try{
    const {data}= await axios.get(`${url2}/country`)
    return data.map((country)=> country.Country)

  }catch(error){

    
  }
}