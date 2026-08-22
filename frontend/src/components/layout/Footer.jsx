import React from 'react';
import { Icons } from '../common/Icons';

const Footer = () => {
    return (
        <footer className="footer" id="contact">
            <div className="footer-grid">
                <div className="footer-brand">
                    <h3>Aura<span>Bite</span></h3>
                    <p>Premium food delivery bringing the best restaurants in your city directly to your doorstep. Quality food, fast delivery.</p>
                    <div className="socials">
                        <a href="#"><Icons.Instagram /></a>
                        <a href="#"><Icons.Twitter /></a>
                        <a href="#"><Icons.Facebook /></a>
                        <a href="#"><Icons.Youtube /></a>
                    </div>
                </div>
                <div className="footer-col">
                    <h4>Company</h4>
                    <a href="#">About Us</a>
                    <a href="#">Careers</a>
                    <a href="#">Blog</a>
                    <a href="#">Press</a>
                </div>
                <div className="footer-col">
                    <h4>For You</h4>
                    <a href="#">Restaurants</a>
                    <a href="#">Cuisines</a>
                    <a href="#">Offers</a>
                    <a href="#">Gift Cards</a>
                </div>
                <div className="footer-col">
                    <h4>Support</h4>
                    <a href="#">Help Center</a>
                    <a href="#">Track Order</a>
                    <a href="#">Refunds</a>
                    <a href="#">Contact Us</a>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; 2026 AuraBite. All rights reserved.</p>
                <p>Made with premium taste</p>
            </div>
        </footer>
    );
}

export default Footer;
