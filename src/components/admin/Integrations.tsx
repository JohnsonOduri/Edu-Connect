
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Plug, 
  Video, 
  FileText, 
  LucideIcon,
  CreditCard, 
  Mail,
  MessageSquare,
  Github,
  Gitlab,
  Drill,
  Layers,
  Trophy
} from "lucide-react";

export const Integrations = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Integrations & Customization</h2>
        <p className="text-muted-foreground mt-1">
          Connect third-party services and customize your platform
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <IntegrationCard
          title="Zoom"
          description="Video conferencing for virtual classrooms"
          icon={Video}
          status="Connected"
          connected={true}
        />
        
        <IntegrationCard
          title="Google Drive"
          description="Cloud storage for course materials"
          icon={FileText}
          status="Connected"
          connected={true}
        />
        
        <IntegrationCard
          title="Stripe"
          description="Payment processing for course enrollment"
          icon={CreditCard}
          status="Not Connected"
          connected={false}
        />
        
        <IntegrationCard
          title="Mailchimp"
          description="Email marketing and newsletters"
          icon={Mail}
          status="Not Connected"
          connected={false}
        />
        
        <IntegrationCard
          title="Slack"
          description="Team communication and collaboration"
          icon={MessageSquare}
          status="Connected"
          connected={true}
        />
        
        <IntegrationCard
          title="GitHub"
          description="Code repositories for programming courses"
          icon={Github}
          status="Not Connected"
          connected={false}
        />
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Gamification Features</h3>
        <p className="text-muted-foreground mb-6">
          Enable gamification elements to increase student engagement
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GamificationCard 
            title="XP & Badges"
            description="Reward students with experience points and badges for completing activities"
            icon={Trophy}
          />
          
          <GamificationCard 
            title="Leaderboards"
            description="Create competitive rankings based on student performance"
            icon={Layers}
          />
          
          <GamificationCard 
            title="Daily Challenges"
            description="Generate daily tasks to encourage regular engagement"
            icon={Drill}
          />
        </div>
      </div>
    </div>
  );
};

interface IntegrationCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  status: string;
  connected: boolean;
}

const IntegrationCard = ({ title, description, icon: Icon, status, connected }: IntegrationCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <Badge variant={connected ? "default" : "outline"}>
            {status}
          </Badge>
        </div>
        <CardDescription className="mt-1">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-sm">Enable Integration</span>
          <Switch checked={connected} />
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="w-full">
          {connected ? "Configure" : "Connect"}
        </Button>
      </CardFooter>
    </Card>
  );
};

interface GamificationCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

const GamificationCard = ({ title, description, icon: Icon }: GamificationCardProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
        <CardDescription className="mt-2">
          {description}
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-between">
        <span className="text-sm font-medium">Enable Feature</span>
        <Switch />
      </CardFooter>
    </Card>
  );
};
