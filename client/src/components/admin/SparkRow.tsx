import { memo } from 'react';
import { motion } from 'framer-motion';
import { Flame, Edit2, Trash2, Play, Headphones, BookOpen, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Spark } from '@shared/schema';

const mediaTypes = [
  { value: 'video', icon: Play },
  { value: 'audio', icon: Headphones },
  { value: 'quick-read', icon: BookOpen },
  { value: 'download', icon: Download },
];

function getMediaIcon(type: string) {
  const media = mediaTypes.find(m => m.value === type);
  return media?.icon || Play;
}

interface SparkRowProps {
  spark: Spark;
  index: number;
  onEdit: (spark: Spark) => void;
  onDelete: (spark: Spark) => void;
}

function SparkRowComponent({ spark, index, onEdit, onDelete }: SparkRowProps) {
  const MediaIcon = getMediaIcon(spark.mediaType || 'video');
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4"
      data-testid={`spark-row-${spark.id}`}
    >
      {spark.thumbnailUrl ? (
        <img 
          src={spark.thumbnailUrl} 
          alt="" 
          className="w-20 h-14 rounded-lg object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-20 h-14 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
          <Flame className="h-6 w-6 text-orange-600" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <h3 className="font-bold text-gray-900 truncate">{spark.title}</h3>
          <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full capitalize">
            {spark.category.replace('-', ' ')}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            spark.status === 'published' ? 'bg-green-100 text-green-700' :
            spark.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
            spark.status === 'draft' ? 'bg-gray-100 text-gray-600' :
            'bg-red-100 text-red-600'
          }`}>
            {spark.status || 'draft'}
          </span>
          {spark.featured && (
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Featured</span>
          )}
          {spark.audienceSegment && (
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full capitalize">
              {spark.audienceSegment.replace('-', ' ')}
            </span>
          )}
          <MediaIcon className="h-4 w-4 text-gray-400" />
        </div>
        <p className="text-sm text-gray-500 truncate">{spark.description}</p>
        {spark.dailyDate && (
          <p className="text-xs text-gray-400 mt-1">Daily: {spark.dailyDate}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onEdit(spark)}
          data-testid={`button-edit-spark-${spark.id}`}
        >
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onDelete(spark)}
          className="text-red-600 hover:bg-red-50"
          data-testid={`button-delete-spark-${spark.id}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}

function arePropsEqual(prevProps: SparkRowProps, nextProps: SparkRowProps): boolean {
  if (prevProps.index !== nextProps.index) return false;
  
  const prevSpark = prevProps.spark;
  const nextSpark = nextProps.spark;
  
  return (
    prevSpark.id === nextSpark.id &&
    prevSpark.title === nextSpark.title &&
    prevSpark.description === nextSpark.description &&
    prevSpark.status === nextSpark.status &&
    prevSpark.featured === nextSpark.featured &&
    prevSpark.audienceSegment === nextSpark.audienceSegment &&
    prevSpark.dailyDate === nextSpark.dailyDate &&
    prevSpark.thumbnailUrl === nextSpark.thumbnailUrl &&
    prevSpark.category === nextSpark.category &&
    prevSpark.mediaType === nextSpark.mediaType &&
    prevSpark.publishAt === nextSpark.publishAt &&
    prevSpark.weekTheme === nextSpark.weekTheme &&
    prevSpark.ctaPrimary === nextSpark.ctaPrimary &&
    prevSpark.prayerLine === nextSpark.prayerLine &&
    prevSpark.imageUrl === nextSpark.imageUrl &&
    prevSpark.videoUrl === nextSpark.videoUrl &&
    prevSpark.audioUrl === nextSpark.audioUrl &&
    prevSpark.scriptureRef === nextSpark.scriptureRef
  );
}

export const SparkRow = memo(SparkRowComponent, arePropsEqual);

export default SparkRow;
