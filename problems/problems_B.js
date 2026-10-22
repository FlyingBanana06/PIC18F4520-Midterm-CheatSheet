const problems_B = [
{
  id:"ext-nibble-swap",
  title:"B1 — Nibble Swap",
  category:"B. 位元操作",
  tags:["SWAPF","nibble","high","low","半位元組"],
  description:"交換 [0x020] 的高 4 bits 與低 4 bits，存到 [0x021]。",
  testcase:"Testcase 1: [0x020]=0xAB → [0x021]=0xBA",
  code:`LIST p=18f4520
#include <p18f4520.inc>

IN_ADDR  EQU 0x020
OUT_ADDR EQU 0x021

        ORG 0x0000
MAIN:
        ; --- Initialize test value ---
        MOVLW   0xAB
        MOVWF   IN_ADDR

        ; --- Swap nibbles and store ---
        MOVF    IN_ADDR, W
        SWAPF   WREG, W
        MOVWF   OUT_ADDR
DONE:
        BRA     DONE
        END`
},
{
  id:"ext-b2-reverse",
  title:"B2 — 8-bit Bit Reversal (No Loop)",
  category:"B. 位元操作",
  tags:["RRNCF","RLCF","bit reverse","無 loop"],
  description:"將 [0x020] 的 8 bits 完全反轉，存到 [0x021]。\n限制：必須不使用 loop（不可用 GOTO/BRA/DECFSZ），只能固定展開指令。",
  testcase:"Testcase 1: [0x020]=b'11010010' → [0x021]=b'01001011'",
  code:`LIST p=18f4520
#include <p18f4520.inc>

        ORG 0x0000
MAIN:
        ; --- Init: Load source to 0x020, clear result 0x021 ---
        MOVLW   b'11010010'
        MOVWF   0x020
        CLRF    0x021       

        ; --- Unrolled loop: 8 times bit reversal ---
        ; RRCF pushes LSB to Carry, RLCF pushes Carry to MSB of result
        RRCF    0x020, F
        RLCF    0x021, F
        
        RRCF    0x020, F
        RLCF    0x021, F
        
        RRCF    0x020, F
        RLCF    0x021, F
        
        RRCF    0x020, F
        RLCF    0x021, F
        
        RRCF    0x020, F
        RLCF    0x021, F
        
        RRCF    0x020, F
        RLCF    0x021, F
        
        RRCF    0x020, F
        RLCF    0x021, F
        
        RRCF    0x020, F
        RLCF    0x021, F
DONE:
        BRA     DONE
        END`
},
{
  id:"ext-bit-mask",
  title:"B3 — Bit Mask Separation (Even/Odd Bits)",
  category:"B. 位元操作",
  tags:["ANDLW","mask","bit separation","even bits","odd bits"],
  description:"將 [0x020] 的偶數位元(bit0,2,4,6)與奇數位元(bit1,3,5,7)分離，\n分別存到 [0x021] 與 [0x022]。",
  testcase:"Testcase 1: [0x020]=b'10110101'\n  → [0x021]=0x15 (even), [0x022]=0xA0 (odd)",
  code:`LIST p=18f4520
#include <p18f4520.inc>

IN_ADDR  EQU 0x020
EVEN_OUT EQU 0x021
ODD_OUT  EQU 0x022

        ORG 0x0000
MAIN:
        ; --- Initialize test value ---
        MOVLW   b'10110101'
        MOVWF   IN_ADDR

        ; --- Extract even bits (mask 0x55) ---
        MOVF    IN_ADDR, W
        ANDLW   0x55
        MOVWF   EVEN_OUT

        ; --- Extract odd bits (mask 0xAA) ---
        MOVF    IN_ADDR, W
        ANDLW   0xAA
        MOVWF   ODD_OUT
DONE:
        BRA     DONE
        END`
},
{
  id:"ext-popcount",
  title:"B4 — Popcount (Count 1s)",
  category:"B. 位元操作",
  tags:["BTFSS","popcount","count ones","bit count","計數"],
  description:"計算 [0x020] 中 bit=1 的個數，存到 [0x021]。",
  testcase:"Testcase 1: [0x020]=0xB2 → [0x021]=0x05\nTestcase 2: [0x020]=0xFF → [0x021]=0x08",
  code:`LIST p=18f4520
#include <p18f4520.inc>

IN_ADDR  EQU 0x020
OUT_ADDR EQU 0x021
TEMP     EQU 0x022
CNT      EQU 0x023
ONES     EQU 0x024

        ORG 0x0000
MAIN:
        ; --- Initialize test value and counters ---
        MOVLW   0xB2
        MOVWF   IN_ADDR

        MOVF    IN_ADDR, W
        MOVWF   TEMP
        CLRF    ONES
        MOVLW   d'8'
        MOVWF   CNT

LOOP:
        ; --- Shift right and check Carry ---
        RRCF    TEMP, F
        BTFSS   STATUS, C
        GOTO    SKIP
        INCF    ONES, F
SKIP:
        DECFSZ  CNT, F
        GOTO    LOOP

        MOVF    ONES, W
        MOVWF   OUT_ADDR
DONE:
        BRA     DONE
        END`
},
{
  id:"ext-find-first-1",
  title:"B5 — Find First 1",
  category:"B. 位元操作",
  tags:["BTFSC","RRCF","find first 1","找第一個1"],
  description:"從 [0x020] 的 bit0 開始往高位找，找出第一個 bit=1 的位置 (index 0~7)，將 index 存到 [0x021]。\n若全部皆為 0，則 [0x021] = 0xFF。",
  testcase:"Testcase 1: [0x020]=b'00101000' → [0x021]=0x03\nTestcase 2: [0x020]=0x00 → [0x021]=0xFF",
  code:`LIST p=18f4520
#include <p18f4520.inc>

IN_ADDR  EQU 0x020
OUT_ADDR EQU 0x021
TEMP     EQU 0x022
CNT      EQU 0x023
IDX      EQU 0x024

        ORG 0x0000
MAIN:
        ; --- Initialize test value and counters ---
        MOVLW   b'00101000'
        MOVWF   IN_ADDR
        
        MOVF    IN_ADDR, W
        MOVWF   TEMP
        CLRF    IDX
        MOVLW   d'8'
        MOVWF   CNT

LOOP:
        ; --- Check if LSB is 1 ---
        BTFSC   TEMP, 0
        GOTO    FOUND

        ; --- Shift right and increment index ---
        BCF     STATUS, C
        RRCF    TEMP, F
        INCF    IDX, F
        DECFSZ  CNT, F
        GOTO    LOOP

        ; --- Not found (all zeros) ---
        MOVLW   0xFF
        MOVWF   OUT_ADDR
        GOTO    DONE

FOUND:
        ; --- Store index ---
        MOVF    IDX, W
        MOVWF   OUT_ADDR
DONE:
        BRA     DONE
        END`
},
{
  id:"ext-bit-pattern",
  title:"B6 — Check Fixed Bit Pattern (1x0x1x0x)",
  category:"B. 位元操作",
  tags:["ANDLW","XORLW","bit pattern","遮罩","樣式比對"],
  description:"檢查 [0x020] 是否符合 bit 樣式 `b'1x0x1x0x'`。\n符合 → [0x021]=0xFF；否則 → [0x021]=0x00。",
  testcase:"Testcase 1: [0x020]=b'11011101' → [0x021]=0xFF\nTestcase 2: [0x020]=b'11101101' → [0x021]=0x00",
  code:`LIST p=18f4520
#include <p18f4520.inc>

IN_ADDR  EQU 0x020
OUT_ADDR EQU 0x021

        ORG 0x0000
MAIN:
        ; --- Initialize test value ---
        MOVLW   b'11011101'
        MOVWF   IN_ADDR

        ; --- Mask out 'x' bits and compare with 0x88 ---
        MOVF    IN_ADDR, W
        ANDLW   0xAA
        XORLW   0x88
        BZ      MATCH

        MOVLW   0x00
        MOVWF   OUT_ADDR
        GOTO    DONE

MATCH:
        MOVLW   0xFF
        MOVWF   OUT_ADDR
DONE:
        BRA     DONE
        END`
},
{
  id:"ext-bit-flip",
  title:"B7 — Specific Bit Flip",
  category:"B. 位元操作",
  tags:["BTG","特定位元","翻轉"],
  description:"將 [0x020] 的 bit3 與 bit6 翻轉，其他保持不變。",
  testcase:"Testcase 1: [0x020]=b'00000000' → [0x020]=b'01001000'",
  code:`LIST p=18f4520
#include <p18f4520.inc>

        ORG 0x0000
MAIN:
        ; --- Initialize test value ---
        MOVLW   b'00000000'
        MOVWF   0x020

        ; --- Toggle bit 3 and bit 6 ---
        BTG     0x020, 3
        BTG     0x020, 6
DONE:
        BRA     DONE
        END`
},
{
  id:"ext-bit-manip-no-branch",
  title:"B8 — Fixed Bit Manipulation (No Branch)",
  category:"B. 位元操作",
  tags:["IORLW","ANDLW","no branch","無跳躍","位元運算"],
  description:"將 [0x020] 的 bit7 與 bit0 設為 1，並將 bit4 與 bit3 設為 0，其餘位元保持不變。\n限制：不可使用任何 branch 指令（如 GOTO, BRA, BTFSC, BTFSS），只能使用邏輯運算。",
  testcase:"Testcase 1: [0x020]=b'00000000' → [0x020]=b'10000001' (0x81)\nTestcase 2: [0x020]=b'11111111' → [0x020]=b'10011001' (0x99)",
  code:`LIST p=18f4520
#include <p18f4520.inc>

        ORG 0x0000
MAIN:
        ; --- Initialize test value ---
        MOVLW   b'00000000'
        MOVWF   0x020

        ; --- Set bit7 and bit0 to 1 (mask 0x81) ---
        MOVF    0x020, W
        IORLW   b'10000001'
        
        ; --- Clear bit4 and bit3 to 0 (mask 0xE7) ---
        ANDLW   b'11100111'
        
        MOVWF   0x020
DONE:
        BRA     DONE
        END`
},
{
  id:"ext-cyclic-shift",
  title:"B9 — N-time Cyclic Left Shift",
  category:"B. 位元操作",
  tags:["RLNCF","循環移位","loop"],
  description:"將 [0x020] 循環左移 N 次（N 在 [0x021]）。",
  testcase:"Testcase 1: [0x020]=0x81, [0x021]=0x01 → [0x020]=0x03",
  code:`LIST p=18f4520
#include <p18f4520.inc>

        ORG 0x0000
MAIN:
        ; --- Initialize test values ---
        MOVLW   0x81
        MOVWF   0x020
        MOVLW   0x01
        MOVWF   0x021

        ; --- Setup loop counter ---
        MOVF    0x021, W
        BZ      DONE
        MOVWF   0x022

SHIFT_LOOP:
        ; --- Perform cyclic left shift ---
        RLNCF   0x020, F
        DECFSZ  0x022, F
        BRA     SHIFT_LOOP
DONE:
        BRA     DONE
        END`
},
{
  id:"ext-gray",
  title:"B10 — Binary to Gray Code",
  category:"B. 位元操作",
  tags:["XORWF","RRNCF","gray code","gray","格雷碼"],
  description:"將 [0x020] 的二進位值轉成 Gray code，存到 [0x021]。Gray = b XOR (b >> 1)",
  testcase:"Testcase 1: [0x020]=0x06 (b'0110') → [0x021]=0x05 (b'0101')",
  code:`LIST p=18f4520
#include <p18f4520.inc>

        ORG 0x0000
MAIN:
        ; --- Initialize test value ---
        MOVLW   0x06
        MOVWF   0x020
        MOVF    0x020, W
        MOVWF   0x021

        ; --- Calculate Gray code (b XOR (b >> 1)) ---
        BCF     STATUS, C
        RRNCF   0x020, W
        XORWF   0x021, F
DONE:
        BRA     DONE
        END`
}
];