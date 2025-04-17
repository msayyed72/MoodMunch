import { useLocation } from "wouter";
import { 
  Facebook, 
  Twitter, 
  Instagram
} from "lucide-react";

export default function Footer() {
  const [, navigate] = useLocation();
  
  return (
    <footer className="bg-white border-t border-gray-200 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div className="mb-6 md:mb-0">
            <h2 className="text-xl font-bold mb-2">
              <span className="text-primary">Food</span>
              <span className="text-secondary">Mood</span>
            </h2>
            <p className="text-gray-700 opacity-70">Food recommendations based on your mood.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-gray-800 font-medium mb-2">Company</h3>
              <ul className="space-y-2">
                <li><button className="text-gray-700 opacity-70 hover:opacity-100 transition duration-200">About Us</button></li>
                <li><button className="text-gray-700 opacity-70 hover:opacity-100 transition duration-200">Careers</button></li>
                <li><button className="text-gray-700 opacity-70 hover:opacity-100 transition duration-200">Contact</button></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-gray-800 font-medium mb-2">Support</h3>
              <ul className="space-y-2">
                <li><button className="text-gray-700 opacity-70 hover:opacity-100 transition duration-200">Help Center</button></li>
                <li><button className="text-gray-700 opacity-70 hover:opacity-100 transition duration-200">Safety</button></li>
                <li><button className="text-gray-700 opacity-70 hover:opacity-100 transition duration-200">Terms of Service</button></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-gray-800 font-medium mb-2">Follow Us</h3>
              <div className="flex space-x-3">
                <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200 transition duration-200">
                  <Facebook className="h-5 w-5" />
                </button>
                <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200 transition duration-200">
                  <Twitter className="h-5 w-5" />
                </button>
                <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200 transition duration-200">
                  <Instagram className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-8 text-center md:flex md:justify-between md:text-left">
          <p className="text-gray-700 opacity-70">&copy; {new Date().getFullYear()} FoodMood. All rights reserved.</p>
          <div className="mt-2 md:mt-0">
            <button className="text-gray-700 opacity-70 hover:opacity-100 transition duration-200 mr-4">Privacy Policy</button>
            <button className="text-gray-700 opacity-70 hover:opacity-100 transition duration-200">Terms of Service</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
