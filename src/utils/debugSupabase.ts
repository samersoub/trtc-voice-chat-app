import { supabase, isSupabaseReady } from '@/services/db/supabaseClient';

export async function debugSupabaseConnection() {
  console.log('=== Supabase Debug ===');
  console.log('Is Ready:', isSupabaseReady);
  
  if (!supabase) {
    console.error('❌ Supabase client is null');
    return;
  }

  try {
    // Test connection
    const { data: testData, error: testError } = await supabase
      .from('voice_room_seats')
      .select('*')
      .limit(1);
    
    if (testError) {
      console.error('❌ Failed to query voice_room_seats:', testError.message);
      console.error('Error details:', testError);
    } else {
      console.log('✅ Successfully connected to voice_room_seats');
      console.log('Sample data:', testData);
    }

    // Test messages table
    const { data: msgData, error: msgError } = await supabase
      .from('voice_room_messages')
      .select('*')
      .limit(1);
    
    if (msgError) {
      console.error('❌ Failed to query voice_room_messages:', msgError.message);
      console.error('Error details:', msgError);
    } else {
      console.log('✅ Successfully connected to voice_room_messages');
      console.log('Sample data:', msgData);
    }

    // Test insert permission
    const testRoomId = 'test-room-debug';
    const { error: insertError } = await supabase
      .from('voice_room_messages')
      .insert({
        room_id: testRoomId,
        user_id: 'debug-user',
        user_name: 'Debug User',
        message: 'Test message from debugger',
        message_type: 'system'
      });

    if (insertError) {
      console.error('❌ Failed to insert test message:', insertError.message);
      console.error('Error details:', insertError);
    } else {
      console.log('✅ Successfully inserted test message');
      
      // Clean up
      await supabase
        .from('voice_room_messages')
        .delete()
        .eq('room_id', testRoomId);
      console.log('✅ Cleaned up test data');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Auto-run on import in development
if (import.meta.env.DEV) {
  debugSupabaseConnection();
}
