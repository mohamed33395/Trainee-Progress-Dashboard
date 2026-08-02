# التعديلات المطلوبة في src/page-components/Tasks.tsx

## 1. إزالة instructorRating من submissionData (السطر 48-56)
استبدل:
```typescript
    // Submission state
    const [submissionData, setSubmissionData] = useState({
        codeSnippetImage: null as string | null,
        codeSnippetFile: null as File | null,
        projectImage: null as string | null,
        projectFile: null as File | null,
        details: '',
        instructorRating: 5,
    })
```

بـ:
```typescript
    // Submission state
    const [submissionData, setSubmissionData] = useState({
        codeSnippetImage: null as string | null,
        codeSnippetFile: null as File | null,
        projectImage: null as string | null,
        projectFile: null as File | null,
        details: '',
    })
```

## 2. إضافة state للمراجعة (أضف بعد السطر 56)
```typescript
    // Review state
    const [reviewData, setReviewData] = useState({
        rating: 5,
        feedback: ''
    })
    const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
```

## 3. تعديل handleSubmitTask (السطر 135-161)
استبدل:
```typescript
    const handleSubmitTask = () => {
        if (!selectedTask || !submissionData.codeSnippetImage || !submissionData.projectImage || !submissionData.details) {
            return
        }

        updateTask(selectedTask.id, {
            status: 'submitted',
            submission: {
                codeSnippetImage: submissionData.codeSnippetImage,
                projectImage: submissionData.projectImage,
                details: submissionData.details,
                instructorRating: submissionData.instructorRating,
                submittedAt: new Date().toISOString(),
            }
        })

        setIsSubmissionOpen(false)
        setSelectedTask(undefined)
        setSubmissionData({
            codeSnippetImage: null,
            codeSnippetFile: null,
            projectImage: null,
            projectFile: null,
            details: '',
            instructorRating: 5,
        })
    }
```

بـ:
```typescript
    const handleSubmitTask = () => {
        if (!selectedTask || !submissionData.codeSnippetImage || !submissionData.projectImage || !submissionData.details) {
            return
        }

        updateTask(selectedTask.id, {
            status: 'submitted',
            submission: {
                codeSnippetImage: submissionData.codeSnippetImage,
                projectImage: submissionData.projectImage,
                details: submissionData.details,
                submittedAt: new Date().toISOString(),
            }
        })

        setIsSubmissionOpen(false)
        setSelectedTask(undefined)
        setSubmissionData({
            codeSnippetImage: null,
            codeSnippetFile: null,
            projectImage: null,
            projectFile: null,
            details: '',
        })
    }
```

## 4. تعديل handleReviewTask (السطر 163-193)
استبدل:
```typescript
    const handleReviewTask = async (taskId: string, approved: boolean) => {
        const task = tasks.find(t => t.id === taskId)
        if (task && task.submission) {
            await updateTask(taskId, {
                status: approved ? 'completed' : 'rejected',
                submission: {
                    ...task.submission,
                    reviewedAt: new Date().toISOString(),
                    instructorFeedback: approved ? 'Great work!' : 'Please review and resubmit.',
                }
            })

            // If approved, update trainee skills progress
            if (approved && task.skills && task.maxScore) {
                const trainee = trainees.find(t => t.id === task.assignedTraineeId)
                if (trainee) {
                    const scorePercentage = (task.submission.instructorRating / task.maxScore) * 100
                    const updatedSkillsProgress = { ...trainee.skillsProgress }

                    task.skills.forEach(skill => {
                        const currentProgress = updatedSkillsProgress[skill] || 0
                        // Add the score percentage to the skill progress (capped at 100)
                        updatedSkillsProgress[skill] = Math.min(100, currentProgress + scorePercentage * 0.1)
                    })

                    // Update trainee skills progress through context
                    await updateTrainee(trainee.id, { skillsProgress: updatedSkillsProgress })
                }
            }
        }
    }
```

بـ:
```typescript
    const handleReviewTask = async (taskId: string, approved: boolean) => {
        const task = tasks.find(t => t.id === taskId)
        if (task && task.submission) {
            await updateTask(taskId, {
                status: approved ? 'completed' : 'rejected',
                submission: {
                    ...task.submission,
                    instructorRating: reviewData.rating,
                    instructorFeedback: reviewData.feedback,
                    reviewedAt: new Date().toISOString(),
                }
            })

            // If approved, update trainee skills progress
            if (approved && task.skills && task.maxScore) {
                const trainee = trainees.find(t => t.id === task.assignedTraineeId)
                if (trainee) {
                    const scorePercentage = (reviewData.rating / task.maxScore) * 100
                    const updatedSkillsProgress = { ...trainee.skillsProgress }

                    task.skills.forEach(skill => {
                        const currentProgress = updatedSkillsProgress[skill] || 0
                        // Add the score percentage to the skill progress (capped at 100)
                        updatedSkillsProgress[skill] = Math.min(100, currentProgress + scorePercentage * 0.1)
                    })

                    // Update trainee skills progress through context
                    await updateTrainee(trainee.id, { skillsProgress: updatedSkillsProgress })
                }
            }
            
            setIsReviewDialogOpen(false)
            setReviewData({ rating: 5, feedback: '' })
        }
    }
```

## 5. تعديل أزرار Approve/Reject (السطر 416-431)
استبدل:
```typescript
                                    {task.status === 'submitted' && !effectiveTraineeId && isTeamLeader() && (
                                        <div className="flex gap-2 mt-3">
                                            <Button
                                                variant="default"
                                                size="sm"
                                                onClick={() => handleReviewTask(task.id, true)}
                                            >
                                                {t.tasks.approve}
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleReviewTask(task.id, false)}
                                            >
                                                {t.tasks.reject}
                                            </Button>
                                        </div>
                                    )}
```

بـ:
```typescript
                                    {task.status === 'submitted' && !effectiveTraineeId && isTeamLeader() && (
                                        <div className="flex gap-2 mt-3">
                                            <Button
                                                variant="default"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedTask(task)
                                                    setIsReviewDialogOpen(true)
                                                }}
                                            >
                                                {t.tasks.approve}
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedTask(task)
                                                    setIsReviewDialogOpen(true)
                                                }}
                                            >
                                                {t.tasks.reject}
                                            </Button>
                                        </div>
                                    )}
```

## 6. إخفاء التقييم عن المتدرب في عرض المهام (السطر 717-721)
استبدل:
```typescript
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <Label className="text-muted-foreground">Rating</Label>
                                            <p className="font-medium">{selectedTask.submission.instructorRating}/10</p>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground">Submitted At</Label>
                                            <p className="font-medium">
                                                {new Date(selectedTask.submission.submittedAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
```

بـ:
```typescript
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        {!isTrainee() && selectedTask.submission.instructorRating && (
                                            <div>
                                                <Label className="text-muted-foreground">Rating</Label>
                                                <p className="font-medium">{selectedTask.submission.instructorRating}/10</p>
                                            </div>
                                        )}
                                        <div>
                                            <Label className="text-muted-foreground">Submitted At</Label>
                                            <p className="font-medium">
                                                {new Date(selectedTask.submission.submittedAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
```

## 7. إضافة Dialog للمراجعة (أضف قبل السطر 867 - قبل إغلاق div النهائي)
```typescript
            {/* Review Dialog */}
            <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Review Task</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="rating">Rating (1-10)</Label>
                            <Input
                                id="rating"
                                type="number"
                                min="1"
                                max="10"
                                value={reviewData.rating}
                                onChange={(e) => setReviewData(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="feedback">Feedback</Label>
                            <Textarea
                                id="feedback"
                                value={reviewData.feedback}
                                onChange={(e) => setReviewData(prev => ({ ...prev, feedback: e.target.value }))}
                                placeholder="Add your feedback..."
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={() => handleReviewTask(selectedTask?.id || '', true)}>
                            Approve
                        </Button>
                        <Button variant="destructive" onClick={() => handleReviewTask(selectedTask?.id || '', false)}>
                            Reject
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
```

## 8. إزالة حقل التقييم من نموذج التقديم (ابحث عن Input للrating واحذفه)
ابحث عن:
```typescript
<div className="space-y-2">
    <Label htmlFor="rating">{t.tasks.instructorRating}</Label>
    <Input
        id="rating"
        type="number"
        min="1"
        max="10"
        value={submissionData.instructorRating}
        onChange={(e) => setSubmissionData(prev => ({ ...prev, instructorRating: parseInt(e.target.value) }))}
    />
</div>
```
واحذفه بالكامل.
