import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, DollarSign, Award, CheckCircle, AlertCircle } from 'lucide-react';

interface JobListingCardProps {
  job: any;
  eligible: boolean;
  applied: boolean;
  userQualification: string;
  onApply: () => void;
}

export default function JobListingCard({
  job,
  eligible,
  applied,
  userQualification,
  onApply
}: JobListingCardProps) {
  return (
    <Card className="bg-white hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-xl">{job.title}</CardTitle>
            <CardDescription>{job.department}</CardDescription>
          </div>
          {eligible ? (
            <Badge className="bg-green-600 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Eligible
            </Badge>
          ) : (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Not Eligible
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-700">{job.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-blue-600" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span>{job.salary}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Award className="h-4 w-4 text-purple-600" />
            <span>{job.minQualification} - {job.maxQualification}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-600">Your Qualification: </span>
            <span className="font-medium">{userQualification}</span>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold mb-2">Requirements:</p>
          <ul className="text-sm space-y-1">
            {job.requirements.map((req: string, idx: number) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="text-blue-600">•</span>
                {req}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-2 pt-4">
          {eligible ? (
            <Button
              onClick={onApply}
              disabled={applied}
              className="flex-1"
            >
              {applied ? 'Already Applied' : 'Apply Now'}
            </Button>
          ) : (
            <Button disabled className="flex-1">
              Not Eligible
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
