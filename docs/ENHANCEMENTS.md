# Enhancements / Backlog

## Fitness Week Photos — Upload Not Working
- **Status**: Needs deeper debugging
- **Issue**: "Add Photo" on fitness training weeks does not persist photos. Tried: base64 direct storage, Firebase Storage upload (403 permission error), Firebase Storage with memories/ path prefix, and replicating exact task photo pattern. All silently fail.
- **What works elsewhere**: Task photos (AddTaskModal) use base64 → canvas resize → store in form state. Memories use Firebase Storage upload. Both work fine.
- **Next steps**: Add console.log instrumentation to trace exactly where the flow breaks. Check if `updateTrainingWeek` week ID matching is correct. Check if Firestore save succeeds or silently fails. Consider whether the fitness Firestore document size is the blocker.
