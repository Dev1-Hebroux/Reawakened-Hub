import { Facebook, Instagram, Twitter, Youtube, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <h3 className="text-2xl font-display font-bold text-gray-900 tracking-tighter flex items-center gap-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">R</div>
              REAWAKENED
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              A digital missions base empowering a generation to encounter Jesus, grow in discipleship, and transform the world.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="h-10 w-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all"><Instagram className="h-5 w-5" /></a>
              <a href="#" className="h-10 w-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all"><Youtube className="h-5 w-5" /></a>
              <a href="#" className="h-10 w-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all"><Twitter className="h-5 w-5" /></a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-gray-900 mb-6">Platform</h4>
            <ul className="space-y-4 text-sm text-gray-500 font-medium">
              <li><a href="#" className="hover:text-primary transition-colors">Daily Sparks</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Community Rooms</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Discipleship Paths</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Mission Engine</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-6">Connect</h4>
            <ul className="space-y-4 text-sm text-gray-500 font-medium">
              <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Events</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Support</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-6">Newsletter</h4>
            <p className="text-sm text-gray-500 mb-4">Subscribe to get the latest mission updates and devotionals.</p>
            <div className="flex gap-2">
              <input type="email" placeholder="Your email" className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm flex-1 outline-none focus:border-primary/50" />
              <button className="bg-primary text-white rounded-xl px-4 py-3 font-bold hover:bg-primary/90 transition-colors">
                <Mail className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400 font-medium">
          <p>&copy; 2025 Reawakened Platform. All rights reserved.</p>
          <div className="flex space-x-8 mt-4 md:mt-0">
            <a href="#" className="hover:text-gray-900">Privacy Policy</a>
            <a href="#" className="hover:text-gray-900">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
