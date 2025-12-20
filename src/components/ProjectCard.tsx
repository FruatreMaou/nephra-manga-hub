import { Link } from 'react-router-dom';
import { Star, Clock } from 'lucide-react';
import { ProjectUpdate } from '@/types/manga';
import { getTypeBadgeClass, cleanChapterTitle } from '@/lib/api';

interface ProjectCardProps {
  project: ProjectUpdate;
  index?: number;
}

export function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  return (
    <div 
      className="glass-card rounded-xl p-4 fade-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex gap-4">
        {/* Cover Image */}
        <Link 
          to={`/manga/${project.slug}`}
          className="flex-shrink-0 w-24 h-32 rounded-lg overflow-hidden group"
        >
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <Link 
              to={`/manga/${project.slug}`}
              className="font-display text-sm font-semibold line-clamp-2 hover:text-primary transition-colors"
            >
              {project.title}
            </Link>
            <span className={getTypeBadgeClass(project.type)}>
              {project.type}
            </span>
          </div>

          {/* Chapters */}
          <div className="space-y-1">
            {project.chapters.slice(0, 3).map((chapter, idx) => (
              <Link
                key={chapter.slug}
                to={`/chapter/${chapter.slug}`}
                className="flex items-center justify-between py-1.5 px-2 rounded-lg 
                  bg-muted/30 hover:bg-muted/50 transition-colors group"
              >
                <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                  {cleanChapterTitle(chapter.title)}
                </span>
                {chapter.time && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {chapter.time}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Grid wrapper for project cards
interface ProjectGridProps {
  projects: ProjectUpdate[];
  className?: string;
}

export function ProjectGrid({ projects, className = '' }: ProjectGridProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {projects.map((project, index) => (
        <ProjectCard key={project.slug} project={project} index={index} />
      ))}
    </div>
  );
}

// Skeleton loader
export function ProjectCardSkeleton() {
  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex gap-4">
        <div className="w-24 h-32 rounded-lg shimmer" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded shimmer" />
          <div className="h-3 w-1/4 rounded shimmer" />
          <div className="space-y-1 mt-3">
            <div className="h-8 rounded shimmer" />
            <div className="h-8 rounded shimmer" />
            <div className="h-8 rounded shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProjectGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProjectCardSkeleton key={i} />
      ))}
    </div>
  );
}
