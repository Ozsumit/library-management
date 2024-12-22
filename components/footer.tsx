"use client";
import React from "react";
import Link from "next/link";
import { Github, Instagram, Facebook, Moon } from "lucide-react";
// import WelcomeModalTrigger from "../welcome";

import Image from "next/image";
// import companyLogo from "../public/company-logo.png"; // Adjust the path as necessary

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      icon: Github,
      href: "https://github.com/ozsumit",
      label: "GitHub",
    },
    {
      icon: Instagram,
      href: "https://instagram.com/sumitp0khrel",
      label: "Instagram",
    },
    {
      icon: Facebook,
      href: "https://facebook.com/ozsumit",
      label: "Facebook",
    },
  ];

  const footerLinks = [
    { href: "/", label: "Home" },
    { href: "/books", label: "Books" },
    { href: "/authors", label: "Authors" },
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-gray-200 rounded-t-3xl shadow-2xl py-16 px-4 sm:px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand Section */}
          <div className="flex flex-col items-center md:items-start space-y-6">
            <Link href="/" className="group">
              <div className="flex items-center space-x-3">
                <Moon
                  className="text-indigo-500 fill-indigo-500 group-hover:rotate-12 transition-transform"
                  size={36}
                />
                <h1 className="text-white font-bold text-3xl group-hover:text-indigo-400 transition-colors">
                  Crescent Moon Library
                </h1>
              </div>
            </Link>
            <p className="text-gray-400 text-center md:text-left max-w-xs leading-relaxed">
              Discover a world of knowledge and adventure. Your ultimate
              destination for endless reading.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center md:items-start space-y-6">
            <h2 className="text-white font-semibold text-xl border-b-2 border-indigo-500 pb-2 w-full text-center md:text-left">
              Quick Links
            </h2>
            <nav className="w-full">
              <ul className="space-y-3 text-center md:text-left">
                {footerLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-indigo-400 hover:translate-x-2 transition-all inline-block"
                    >
                      → {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Social Links */}
          <div className="flex flex-col items-center md:items-start space-y-6">
            <h2 className="text-white font-semibold text-xl border-b-2 border-indigo-500 pb-2 w-full text-center md:text-left">
              Connect With Us
            </h2>
            <div className="flex space-x-6">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="text-gray-300 hover:text-indigo-400 transition-all transform hover:scale-125 hover:rotate-6"
                >
                  <social.icon className="w-7 h-7" />
                </Link>
              ))}
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 shadow-lg w-full text-center">
              <p className="text-gray-400 mb-3">
                Love books? Join our community!
              </p>
              <Link
                href="/about"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-all transform hover:scale-105 inline-block"
              >
                Learn More
              </Link>
              {/* <WelcomeModalTrigger>Help</WelcomeModalTrigger> */}
            </div>
          </div>
        </div>

        {/* Company Logo */}
        <div className="mt-12 flex justify-center">
          <Image
            src="https://repo.sumit.info.np/images/brandicon.svg"
            alt="Company Logo"
            width={150}
            height={150}
          />
        </div>

        {/* Footer Bottom */}
        <div className="mt-12 border-t border-gray-700 pt-6 text-sm flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 mb-4 md:mb-0 text-center w-full md:w-auto">
            &copy; {currentYear} Crescent Moon Library. All rights reserved.
          </p>
          <div className="space-x-4 flex flex-col md:flex-row items-center text-center w-full md:w-auto">
            <Link
              href="/privacy"
              className="text-gray-400 hover:text-indigo-400 transition-colors mb-2 md:mb-0 block md:inline"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-gray-400 hover:text-indigo-400 transition-colors block md:inline"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
