"use client";

import React from 'react'
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";


export const Projects = () => {
    const projects = [
        {
          title: "Project 1",
          description: "Description of project 1",
          src: "https://aceternity.com/cdn-cgi/image/width=2048/https://assets.aceternity.com/macbook-scroll.png",
          link: "https://example.com/project1",
        },
        {
          title: "Project 2",
          description: "Description of project 2",
          src: "https://aceternity.com/cdn-cgi/image/width=2048/https://assets.aceternity.com/text-hover-effect.webp",
          link: "https://example.com/project2",
        },
        {
          title: "Project 3",
          description: "Description of project 3",
          src: "https://aceternity.com/cdn-cgi/image/width=2048/https://assets.aceternity.com/floating-dock.png",
          link: "https://example.com/project3",
        },
        {
          title: "Background Gradient Animation",
          description: "A smooth and elegant background gradient animation that changes the gradient position over time.",
          src: "https://aceternity.com/cdn-cgi/image/width=2048/https://assets.aceternity.com/background-gradient-animation.png",
          link: "https://example.com/project4",
        },
      ];
      
  return (
    <div className='py-10'>
        <h4 className='text-primary font-bold text-2xl'>Projects</h4>
        <p className='text-secondary  pt-2 text-sm md:text-sm'>
        I love building web apps and prodcuts that can make a difference in the world.
    </p>
    <div className='grid grid-cols-1 md:grid-cols-2 py-4 gap-4 mt-4'>
        {projects.map((project, idx) => (
          <motion.div
            key={project.title}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: idx * 0.1,
              ease: "easeInOut"
            }}
            className="group relative mb-4 overflow-hidden rounded-2xl"
          >
            <Link href={project.link} className="block w-full h-full">
              <div className="relative w-full h-full group overflow-hidden rounded-2xl">
                <motion.div
                  className="w-full h-full"
                  initial={{ filter: "blur(0px)", scale: 1, opacity: 1 }}
                  whileHover={{
                    filter: "blur(30px) brightness(0.3)",
                    opacity: 0.2,
                    transition: { 
                      duration: 0.8,
                      ease: [0.22, 1, 0.36, 1]
                    }
                  }}
                >
                  <Image 
                    src={project.src} 
                    alt={project.title} 
                    width={500} 
                    height={500}
                    priority={idx < 2} // Add priority to first two images for better LCP
                    className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                  />
                </motion.div>
                <div className="absolute inset-0 flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/80 to-transparent">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                    className="space-y-2"
                  >
                    <motion.h2 
                      className="text-white text-2xl font-medium tracking-tight"
                      initial={{ x: -10 }}
                      whileInView={{ x: 0 }}
                      transition={{ delay: 0.1, duration: 0.3 }}
                    >
                      {project.title}
                    </motion.h2>
                    <motion.div className="w-12 h-0.5 bg-white/30 mb-2"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      transition={{ delay: 0.2, duration: 0.4 }}
                    />
                    <motion.p 
                      className="text-gray-300/90 text-sm leading-relaxed max-w-md"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.4 }}
                    >
                      {project.description}
                    </motion.p>
                  </motion.div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
    </div>
    </div>
  )
}