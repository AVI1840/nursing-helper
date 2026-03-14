import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AncillaryRight } from '@/data/nursingData';
import * as Icons from 'lucide-react';
import { X, ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface RightCardProps {
  right: AncillaryRight;
}

const RightCard = ({ right }: RightCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Dynamically get icon component
  const IconComponent = (Icons as any)[right.icon] || Icons.Gift;

  // Determine icon color type
  const getIconType = () => {
    if (['electricity', 'water'].includes(right.id)) return 'primary';
    if (['survivor_hours', 'worker_permit'].includes(right.id)) return 'success';
    return 'money';
  };

  const iconType = getIconType();

  return (
    <>
      <div className="right-card h-full">
        <div className={`icon-circle ${iconType}`}>
          <IconComponent className="w-7 h-7 text-white" />
        </div>
        
        <h3 className="text-xl font-bold text-foreground mb-2">
          {right.title}
        </h3>
        
        <p className="text-muted-foreground mb-4 flex-1">
          {right.description}
        </p>
        
        <div className="flex items-center justify-between mt-auto">
          <span className="value-badge">
            {right.value}
          </span>
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-1 text-primary font-medium hover:underline"
          >
            <span>איך לממש?</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Action Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className={`icon-circle ${iconType} mx-auto mb-4`}>
              <IconComponent className="w-7 h-7 text-white" />
            </div>
            <DialogTitle className="text-2xl text-center">
              {right.title}
            </DialogTitle>
            <DialogDescription className="text-center text-lg pt-2">
              {right.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-6 p-4 rounded-xl bg-secondary/50">
            <h4 className="font-semibold text-foreground mb-2">צעדים למימוש:</h4>
            <p className="text-muted-foreground">{right.action}</p>
          </div>
          
          <div className="mt-4 p-4 rounded-xl bg-accent/10 border border-accent/20">
            <div className="flex items-center gap-2">
              <span className="text-accent font-bold">שווי ההטבה:</span>
              <span className="value-badge">{right.value}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RightCard;
