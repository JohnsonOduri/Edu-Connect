
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Assignment } from "./types/assignment-types";
import { AssignmentCard } from "./AssignmentCard";
import { FileText } from "lucide-react";

interface AssignmentListProps {
  assignments: Assignment[];
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>;
}

export const AssignmentList = ({ assignments, setAssignments }: AssignmentListProps) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const filteredAssignments = assignments?.filter(assignment => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !assignment.submitted;
    if (filter === 'completed') return assignment.submitted;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Assignments</h2>
        <Tabs value={filter} onValueChange={(value) => setFilter(value as any)} className="w-auto">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {(!assignments || assignments.length === 0) ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssignments?.map((assignment) => (
            <AssignmentCard 
              key={assignment.id} 
              assignment={assignment} 
              setAssignments={setAssignments} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

const EmptyState = () => {
  return (
    <div className="text-center py-12">
      <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
      <h3 className="mt-4 text-lg font-medium">No Assignments Found</h3>
      <p className="mt-2 text-muted-foreground">
        You don't have any assignments at the moment.
      </p>
    </div>
  );
};
