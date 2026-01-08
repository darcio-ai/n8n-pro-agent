-- Add DELETE policy for messages table
-- Allows users to delete messages from their own conversations
CREATE POLICY "Users can delete messages from their conversations" 
ON public.messages 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM conversations 
  WHERE conversations.id = messages.conversation_id 
  AND conversations.user_id = auth.uid()
));