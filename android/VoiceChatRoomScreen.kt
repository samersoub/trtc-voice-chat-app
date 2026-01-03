package com.example.voicechat

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.zIndex

// Color Palette
object VoiceChatColors {
    val DeepBackground = Color(0xFF1A1A2E)
    val DarkPurple = Color(0xFF16213E)
    val NeonBlue = Color(0xFF0F3460)
    val AccentPurple = Color(0xFF533483)
    val NeonPink = Color(0xFFE94560)
    val BrightBlue = Color(0xFF4A9FFF)
    val OrangeGift = Color(0xFFFF6B35)
    val ChatBubbleBg = Color(0x80000000)
    val EmptySeatGray = Color(0xFF3A3A4E)
    val WhiteText = Color(0xFFFFFFFF)
    val GrayText = Color(0xFFB8B8B8)
    val GoldFrame = Color(0xFFFFD700)
}

// Data Models
data class SeatUser(
    val id: Int,
    val name: String,
    val avatarColor: Color,
    val hasFrame: Boolean = false,
    val frameColor: Color = VoiceChatColors.GoldFrame,
    val isMuted: Boolean = false
)

data class ChatMessage(
    val badge: String,
    val badgeIcon: String? = null,
    val username: String,
    val usernameColor: Color,
    val message: String,
    val isSystemMessage: Boolean = false
)

@Composable
fun VoiceChatRoomScreen() {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(
                        VoiceChatColors.DarkPurple,
                        VoiceChatColors.DeepBackground,
                        VoiceChatColors.NeonBlue
                    )
                )
            )
    ) {
        Column(
            modifier = Modifier.fillMaxSize()
        ) {
            // Top Header
            TopHeader()
            
            Spacer(modifier = Modifier.height(32.dp))
            
            // Seating Grid (Center)
            SeatingGrid(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
                    .padding(horizontal = 16.dp)
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Bottom spacing for chat and action bar
            Spacer(modifier = Modifier.height(200.dp))
        }
        
        // Live Chat Overlay (positioned above bottom bar)
        LiveChatOverlay(
            modifier = Modifier
                .align(Alignment.BottomStart)
                .padding(start = 16.dp, bottom = 80.dp)
                .width(280.dp)
                .height(180.dp)
                .zIndex(1f)
        )
        
        // Bottom Action Bar
        BottomActionBar(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
        )
    }
}

@Composable
fun TopHeader() {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        // Left Side: Avatar, Name, Follow Button
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            // Avatar
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(CircleShape)
                    .background(VoiceChatColors.AccentPurple)
            )
            
            // Room Name
            Text(
                text = "mason chat",
                color = VoiceChatColors.WhiteText,
                fontSize = 16.sp,
                fontWeight = FontWeight.SemiBold
            )
            
            // Follow Button
            Button(
                onClick = { },
                colors = ButtonDefaults.buttonColors(
                    containerColor = VoiceChatColors.BrightBlue
                ),
                shape = RoundedCornerShape(20.dp),
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 4.dp),
                modifier = Modifier.height(28.dp)
            ) {
                Text(
                    text = "Follow",
                    fontSize = 12.sp,
                    color = Color.White
                )
            }
        }
        
        // Right Side: Overlapping Avatars, Viewer Count, Close
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            // Overlapping Avatars
            Box(modifier = Modifier.width(70.dp)) {
                Box(
                    modifier = Modifier
                        .offset(x = 0.dp)
                        .size(28.dp)
                        .clip(CircleShape)
                        .background(Color(0xFFFF6B9D))
                        .border(2.dp, VoiceChatColors.DeepBackground, CircleShape)
                )
                Box(
                    modifier = Modifier
                        .offset(x = 18.dp)
                        .size(28.dp)
                        .clip(CircleShape)
                        .background(Color(0xFF4ECDC4))
                        .border(2.dp, VoiceChatColors.DeepBackground, CircleShape)
                )
                Box(
                    modifier = Modifier
                        .offset(x = 36.dp)
                        .size(28.dp)
                        .clip(CircleShape)
                        .background(Color(0xFFFFA07A))
                        .border(2.dp, VoiceChatColors.DeepBackground, CircleShape)
                )
            }
            
            // Viewer Count
            Text(
                text = "320 >",
                color = VoiceChatColors.WhiteText,
                fontSize = 14.sp,
                fontWeight = FontWeight.Medium
            )
            
            // Close Icon
            IconButton(
                onClick = { },
                modifier = Modifier.size(32.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Close,
                    contentDescription = "Close",
                    tint = VoiceChatColors.WhiteText
                )
            }
        }
    }
}

@Composable
fun SeatingGrid(modifier: Modifier = Modifier) {
    // Dummy seat data
    val speakers = listOf(
        SeatUser(1, "Mason", Color(0xFF6A4C93), false),
        SeatUser(2, "Sophia", Color(0xFF1982C4), false),
        SeatUser(3, "Charlotte", Color(0xFFFF595E), false),
        SeatUser(4, "Ava", Color(0xFF8AC926), hasFrame = true, frameColor = VoiceChatColors.GoldFrame),
        SeatUser(5, "Ryan", Color(0xFFFFCA3A), false)
    )
    
    val bottomSeats = listOf(
        SeatUser(6, "Aby", Color(0xFFFF6B9D), hasFrame = true, frameColor = Color(0xFFFF1493)),
        null, // Empty seat 7
        null, // Empty seat 8
        null, // Empty seat 9
        null  // Empty seat 10
    )
    
    Column(
        modifier = modifier,
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(24.dp)
    ) {
        // Top Row - Speakers
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            speakers.forEach { user ->
                SeatItem(user = user, isEmpty = false)
            }
        }
        
        // Bottom Row - Mixed (User + Empty Seats)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            bottomSeats.forEachIndexed { index, user ->
                if (user != null) {
                    SeatItem(user = user, isEmpty = false)
                } else {
                    EmptySeatItem(seatNumber = index + 7)
                }
            }
        }
    }
}

@Composable
fun SeatItem(user: SeatUser, isEmpty: Boolean) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(8.dp),
        modifier = Modifier.width(64.dp)
    ) {
        Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier.size(64.dp)
        ) {
            // Decorative Frame (if applicable)
            if (user.hasFrame) {
                Box(
                    modifier = Modifier
                        .size(72.dp)
                        .border(
                            width = 3.dp,
                            brush = Brush.linearGradient(
                                colors = listOf(
                                    user.frameColor,
                                    user.frameColor.copy(alpha = 0.6f),
                                    user.frameColor
                                )
                            ),
                            shape = CircleShape
                        )
                )
            }
            
            // Avatar
            Box(
                modifier = Modifier
                    .size(60.dp)
                    .clip(CircleShape)
                    .background(user.avatarColor)
                    .border(2.dp, Color.White.copy(alpha = 0.3f), CircleShape)
            )
            
            // Muted indicator (if muted)
            if (user.isMuted) {
                Box(
                    modifier = Modifier
                        .align(Alignment.BottomEnd)
                        .offset(x = 4.dp, y = 4.dp)
                        .size(20.dp)
                        .clip(CircleShape)
                        .background(VoiceChatColors.NeonPink)
                        .border(2.dp, VoiceChatColors.DeepBackground, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.MicOff,
                        contentDescription = "Muted",
                        tint = Color.White,
                        modifier = Modifier.size(12.dp)
                    )
                }
            }
        }
        
        // Name
        Text(
            text = user.name,
            color = VoiceChatColors.WhiteText,
            fontSize = 12.sp,
            fontWeight = FontWeight.Medium,
            textAlign = TextAlign.Center,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
        )
    }
}

@Composable
fun EmptySeatItem(seatNumber: Int) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(8.dp),
        modifier = Modifier.width(64.dp)
    ) {
        Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier
                .size(60.dp)
                .clip(CircleShape)
                .background(VoiceChatColors.EmptySeatGray)
        ) {
            // Sofa icon placeholder (using Chair icon as substitute)
            Icon(
                imageVector = Icons.Default.EventSeat,
                contentDescription = "Empty Seat",
                tint = VoiceChatColors.GrayText,
                modifier = Modifier.size(28.dp)
            )
        }
        
        // Seat Number
        Text(
            text = "$seatNumber",
            color = VoiceChatColors.GrayText,
            fontSize = 12.sp,
            fontWeight = FontWeight.Normal,
            textAlign = TextAlign.Center
        )
    }
}

@Composable
fun LiveChatOverlay(modifier: Modifier = Modifier) {
    val chatMessages = listOf(
        ChatMessage(
            badge = "Level 16",
            username = "Alex",
            usernameColor = Color(0xFFFFD700),
            message = "Welcome everyone!",
            isSystemMessage = false
        ),
        ChatMessage(
            badge = "⚓",
            username = "Captain",
            usernameColor = Color(0xFF4ECDC4),
            message = "Great vibes here",
            isSystemMessage = false
        ),
        ChatMessage(
            badge = "System",
            username = "",
            usernameColor = Color.White,
            message = "Mason entered the room",
            isSystemMessage = true
        ),
        ChatMessage(
            badge = "Level 5",
            username = "Sarah",
            usernameColor = Color(0xFFFF6B9D),
            message = "Let's chat!",
            isSystemMessage = false
        )
    )
    
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(12.dp))
            .background(VoiceChatColors.ChatBubbleBg)
            .padding(8.dp)
    ) {
        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            items(chatMessages) { message ->
                ChatMessageItem(message)
            }
        }
    }
}

@Composable
fun ChatMessageItem(message: ChatMessage) {
    if (message.isSystemMessage) {
        // System message style
        Row(
            horizontalArrangement = Arrangement.spacedBy(4.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Surface(
                color = Color(0x40FFFFFF),
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier.padding(vertical = 2.dp)
            ) {
                Text(
                    text = message.badge,
                    fontSize = 10.sp,
                    color = VoiceChatColors.GrayText,
                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                )
            }
            Text(
                text = message.message,
                fontSize = 12.sp,
                color = VoiceChatColors.GrayText
            )
        }
    } else {
        // Regular chat message
        Row(
            horizontalArrangement = Arrangement.spacedBy(4.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Badge
            Surface(
                color = Color(0x60FF6B9D),
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier.padding(vertical = 2.dp)
            ) {
                Text(
                    text = message.badge,
                    fontSize = 10.sp,
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                )
            }
            
            // Username
            Text(
                text = "${message.username}:",
                fontSize = 12.sp,
                color = message.usernameColor,
                fontWeight = FontWeight.Bold
            )
            
            // Message
            Text(
                text = message.message,
                fontSize = 12.sp,
                color = VoiceChatColors.WhiteText,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
                modifier = Modifier.weight(1f, fill = false)
            )
        }
    }
}

@Composable
fun BottomActionBar(modifier: Modifier = Modifier) {
    Surface(
        modifier = modifier,
        color = VoiceChatColors.DeepBackground.copy(alpha = 0.95f),
        shadowElevation = 8.dp
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            // Left: Input Field
            Surface(
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(24.dp),
                color = Color(0xFF2A2A3E)
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 10.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(
                        text = "Let's talk",
                        color = VoiceChatColors.GrayText,
                        fontSize = 14.sp,
                        modifier = Modifier.weight(1f)
                    )
                    Icon(
                        imageVector = Icons.Default.SentimentSatisfiedAlt,
                        contentDescription = "Emoji",
                        tint = VoiceChatColors.GrayText,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }
            
            Spacer(modifier = Modifier.width(12.dp))
            
            // Center: Microphone Button
            IconButton(
                onClick = { },
                modifier = Modifier
                    .size(48.dp)
                    .clip(CircleShape)
                    .background(VoiceChatColors.NeonPink)
            ) {
                Icon(
                    imageVector = Icons.Default.MicOff,
                    contentDescription = "Microphone Muted",
                    tint = Color.White,
                    modifier = Modifier.size(24.dp)
                )
            }
            
            Spacer(modifier = Modifier.width(12.dp))
            
            // Right: Settings, Gift, Chat Icons
            Row(
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Settings
                IconButton(
                    onClick = { },
                    modifier = Modifier.size(40.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Settings,
                        contentDescription = "Settings",
                        tint = VoiceChatColors.WhiteText
                    )
                }
                
                // Gift
                Box {
                    IconButton(
                        onClick = { },
                        modifier = Modifier.size(40.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.CardGiftcard,
                            contentDescription = "Gifts",
                            tint = VoiceChatColors.OrangeGift
                        )
                    }
                }
                
                // Chat with Badge
                Box {
                    IconButton(
                        onClick = { },
                        modifier = Modifier.size(40.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.ChatBubble,
                            contentDescription = "Chat",
                            tint = VoiceChatColors.WhiteText
                        )
                    }
                    
                    // Notification Badge
                    Surface(
                        modifier = Modifier
                            .align(Alignment.TopEnd)
                            .offset(x = 4.dp, y = (-4).dp)
                            .size(18.dp),
                        shape = CircleShape,
                        color = VoiceChatColors.NeonPink
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Text(
                                text = "23",
                                color = Color.White,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }
        }
    }
}

@Preview(showBackground = true, widthDp = 360, heightDp = 640)
@Composable
fun VoiceChatRoomScreenPreview() {
    MaterialTheme {
        VoiceChatRoomScreen()
    }
}
