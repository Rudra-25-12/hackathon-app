import { Skeleton } from "@/components/ui/skeleton"

export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl p-5" style={{background:'#1e2433',border:'1px solid #2a3347'}}>
      <Skeleton className="h-3 w-20 mb-3" style={{background:'#2a3347'}}/>
      <Skeleton className="h-8 w-12 mb-2" style={{background:'#2a3347'}}/>
      <Skeleton className="h-2 w-16" style={{background:'#2a3347'}}/>
    </div>
  )
}

export function GoalRowSkeleton() {
  return (
    <div className="flex items-center justify-between px-6 py-4" style={{borderBottom:'1px solid #1a2030'}}>
      <div className="flex-1">
        <Skeleton className="h-4 w-48 mb-2" style={{background:'#2a3347'}}/>
        <Skeleton className="h-3 w-32" style={{background:'#2a3347'}}/>
      </div>
      <Skeleton className="h-6 w-16 rounded-full" style={{background:'#2a3347'}}/>
    </div>
  )
}

export function TableRowSkeleton() {
  return (
    <tr>
      {[140,80,100,40,40,40,60].map((w,i)=>(
        <td key={i} className="px-6 py-4" style={{borderBottom:'1px solid #1a2030'}}>
          <Skeleton className={`h-3 w-${w}`} style={{background:'#2a3347'}}/>
        </td>
      ))}
    </tr>
  )
}

export function PageSkeleton() {
  return (
    <div>
      <div className="mb-8">
        <Skeleton className="h-3 w-16 mb-2" style={{background:'#2a3347'}}/>
        <Skeleton className="h-8 w-48 mb-2" style={{background:'#2a3347'}}/>
        <Skeleton className="h-3 w-32" style={{background:'#2a3347'}}/>
      </div>
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[0,1,2,3].map(i=><StatCardSkeleton key={i}/>)}
      </div>
      <div className="rounded-2xl overflow-hidden" style={{background:'#1e2433',border:'1px solid #2a3347'}}>
        <div className="px-6 py-4" style={{borderBottom:'1px solid #2a3347'}}>
          <Skeleton className="h-4 w-32" style={{background:'#2a3347'}}/>
        </div>
        {[0,1,2,3].map(i=><GoalRowSkeleton key={i}/>)}
      </div>
    </div>
  )
}