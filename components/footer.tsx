"use client";
import React from "react";
import Link from "next/link";
import { Github, Instagram, Facebook, Moon } from "lucide-react";
import Image from "next/image";

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

  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-gray-200 py-16 px-4 sm:px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand Section */}
          <div className="flex flex-col items-center md:items-start space-y-6">
            <Link href="/" className="group">
              <div className="relative flex items-center justify-center w-20 h-20">
                <Moon
                  className="text-indigo-500 fill-indigo-500 group-hover:rotate-12 transition-transform"
                  size={80}
                />
                <Image
                  src="https://repo.sumit.info.np/images/brandicon.svg"
                  alt="Company Logo"
                  width={40}
                  height={40}
                  className="absolute"
                />
              </div>
              <h1 className="text-white font-bold text-3xl group-hover:text-indigo-400 transition-colors mt-3">
                Vass.inc
              </h1>
            </Link>
            <p className="text-gray-400 text-center md:text-left max-w-xs leading-relaxed">
              Discover a world of innovation and excellence. Vass.inc is your partner for boundless opportunities.
            </p>
          </div>

          {/* Social Links */}
          <div className="flex flex-col items-center md:items-start space-y-6">
            <h2 className="text-white font-semibold text-xl border-b-2 border-indigo-500 pb-2 w-full text-center md:text-left">
              Connect With Us
            </h2>
            <div className="flex space-x-6 justify-center">
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
          </div>

          {/* Call to Action */}
          <div className="flex flex-col items-center md:items-start space-y-6">
            <h2 className="text-white font-semibold text-xl border-b-2 border-indigo-500 pb-2 w-full text-center md:text-left">
              Join Our Community
            </h2>
            <p className="text-gray-400 max-w-xs text-center md:text-left">
              Be part of something great. Stay updated with our latest
              innovations and exclusive offers.
            </p>
            <Link
              href="/about"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-all transform hover:scale-105 inline-block"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-12 border-t border-gray-700 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-center md:text-left mb-4 md:mb-0">
            &copy; {currentYear} Vass.inc. All rights reserved.
          </p>
          <div className="space-x-6 flex items-center">
            <Link
              href="/privacy"
              className="text-gray-400 hover:text-indigo-400 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-gray-400 hover:text-indigo-400 transition-colors"
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
