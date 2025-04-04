
import React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Linkedin } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const About = () => {
  const team = [
    {
      name: "Vishnunath A Suresh",
      role: "Project Lead & Full-Stack Developer",
      avatar: "/014455ee-4ed4-490f-a32d-e617501d1a5a.png",
      linkedIn: "https://www.linkedin.com/in/vishnunath-a-suresh/",
    },
    {
      name: "Johnson Oduri",
      role: "Backend & Frontend Developer",
      avatar: "/3574dd6e-2565-4e34-b881-5377c337e015.png",
      linkedIn: "https://www.linkedin.com/in/johnson-oduri-20b08b34b/",
    },
    {
      name: "Issac Roy",
      role: "Backend Developer & System Architect",
      avatar: "/92840a5d-077c-4fdb-b609-a7094a478782.png",
      linkedIn: "https://www.linkedin.com/in/isaac-roy-383724342/",
    },
    {
      name: "Sahaja Pallapothula",
      role: "UI Designer & Content Strategist",
      avatar: "/77ac0f1e-4606-4d9f-b412-5f0c464f51b7.png",
      linkedIn: "https://www.linkedin.com/in/sahaja-pallapothula-22713b329/",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="space-y-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight">About EduConnect</h1>
            <p className="text-xl text-muted-foreground">
              Transforming education through technology and connection
            </p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Our Mission</CardTitle>
                <CardDescription>Bringing education into the digital era</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  EduConnect is a comprehensive learning management system designed to bridge 
                  the gap between educators and students. Our platform provides powerful tools 
                  for course management, assignment tracking, quizzes, coding labs, and more.
                </p>
                <p>
                  We believe that education should be accessible, engaging, and effective. 
                  Our platform is built to facilitate meaningful connections between teachers 
                  and students, making the learning process more interactive and productive.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Features</CardTitle>
                <CardDescription>What makes EduConnect stand out</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 list-disc list-inside">
                  <li>Course Management</li>
                  <li>Interactive Assignments</li>
                  <li>Timed Quizzes</li>
                  <li>Coding Lab</li>
                  <li>Progress Tracking</li>
                  <li>Discussion Forums</li>
                  <li>AI-Assisted Learning</li>
                  <li>Attendance Tracking</li>
                  <li>Study Planner</li>
                  <li>Real-time Feedback</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Our Team</CardTitle>
                <CardDescription>The creators behind EduConnect</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {team.map((member) => (
                    <div key={member.name} className="flex flex-col items-center text-center space-y-2">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                          {member.name.split(' ').map(name => name[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{member.name}</h3>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                        <a 
                          href={member.linkedIn} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 mt-1 text-primary hover:text-primary/80 transition-colors"
                        >
                          <Linkedin className="h-4 w-4" />
                          <span className="text-sm">LinkedIn</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
