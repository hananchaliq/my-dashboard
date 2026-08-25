export interface QuickLink {
   id: string;
   title: string;
   url: string;
}

export interface Settings {
   bgType: "color" | "gradient" | "image";
   bgValue: string;
   lat: number;
   lng: number;
   cityName: string;
}

export interface HourlyWeather {
   time: string;
   temp: number;
   code: number;
}

export interface PrayerTimes {
   Fajr: string;
   Dhuhr: string;
   Asr: string;
   Maghrib: string;
   Isha: string;
}

export interface CurrencyDataPoint {
   time: string;
   price: number;
}
