const problems_C = [
{
  id:"ext-longest-zero",
  title:"C1 - Longest Consecutive 0s",
  category:"C. 迴圈與狀態",
  tags:["BTFSC","最長","連續 0","longest zero"],
  description:"找 [0x000] 中「最長連續 0」的長度，存到 [0x010]。",
  testcase:"Testcase 1: [0x000]=b'10000110' → [0x010]=0x04",
  code:`LIST p=18f4520
#include <p18f4520.inc>

IN_ADDR  EQU 0x000
TEMP     EQU 0x001
CUR_CNT  EQU 0x002
MAX_CNT  EQU 0x003
CNT      EQU 0x004
RES_ADDR EQU 0x010

        ORG 0x0000
MAIN:
        ; --- Initialize test value and counters ---
        MOVLW   b'10000110'
        MOVWF   IN_ADDR

        MOVF    IN_ADDR, W
        MOVWF   TEMP
        CLRF    CUR_CNT
        CLRF    MAX_CNT
        MOVLW   d'8'
        MOVWF   CNT

LOOP:
        ; --- Shift right to check LSB ---
        RRCF    TEMP, F
        BTFSC   STATUS, C
        GOTO    ONE_BIT
        
        ; --- Current bit is 0, increment counter ---
        INCF    CUR_CNT, F
        MOVF    CUR_CNT, W
        CPFSLT  MAX_CNT
        GOTO    NEXT
        ; --- Update max counter ---
        MOVF    CUR_CNT, W
        MOVWF   MAX_CNT
        GOTO    NEXT

ONE_BIT:
        ; --- Current bit is 1, reset counter ---
        CLRF    CUR_CNT

NEXT:
        DECFSZ  CNT, F
        GOTO    LOOP

        MOVF    MAX_CNT, W
        MOVWF   RES_ADDR
DONE:
        BRA     DONE
        END`
},
{
  id:"ext-count-runs",
  title:"C2 — Count Runs of 1s",
  category:"C. 迴圈與狀態",
  tags:["run length","連續","segment","count runs"],
  description:"計算 [0x020] 中有幾個連續 1 的區段。",
  testcase:"Testcase 1: [0x020]=b'10111011' → [0x021]=0x03",
  code:`LIST p=18f4520
#include <p18f4520.inc>

IN_ADDR EQU 0x020
OUT_ADDR EQU 0x021
CNT EQU 0x022
RUNS EQU 0x023
FLAG EQU 0x024

        ORG 0x0000
MAIN:
        ; --- Initialize test value and counters ---
        MOVLW   b'10111011'
        MOVWF   IN_ADDR
        CLRF    RUNS
        CLRF    FLAG
        MOVLW   d'8'
        MOVWF   CNT

LOOP:
        ; --- Check LSB ---
        BTFSS   IN_ADDR, 0
        GOTO    BIT_ZERO
BIT_ONE:
        ; --- If already in a run, skip; otherwise start a new run ---
        BTFSS   FLAG, 0
        GOTO    START_RUN
        GOTO    NEXT_BIT
START_RUN:
        BSF     FLAG, 0
        INCF    RUNS, F
        GOTO    NEXT_BIT
BIT_ZERO:
        ; --- Reset run flag ---
        BCF     FLAG, 0
NEXT_BIT:
        ; --- Shift to next bit ---
        BCF     STATUS, C
        RRCF    IN_ADDR, F
        DECFSZ  CNT, F
        GOTO    LOOP

        MOVF    RUNS, W
        MOVWF   OUT_ADDR
DONE:
        BRA     DONE
        END`
},
{
  id:"ext-longest-same",
  title:"C3 — Longest Consecutive Same Bits",
  category:"C. 迴圈與狀態",
  tags:["連續相同","字串長度","loop"],
  description:"找出 [0x020] 中，最長連續相同的 bit 長度（不論是連續 0 或連續 1）。\n例如 b'00111100' 最長是 4 個 1，答案為 4。",
  testcase:"Testcase 1: [0x020]=b'00111100' → [0x021]=0x04\nTestcase 2: [0x020]=b'11110000' → [0x021]=0x04",
  code:`LIST p=18f4520
#include <p18f4520.inc>

IN_ADDR EQU 0x020
OUT_ADDR EQU 0x021
TEMP EQU 0x022
PREV_BIT EQU 0x023
CUR_CNT EQU 0x024
MAX_CNT EQU 0x025
CNT EQU 0x026

        ORG 0x0000
MAIN:
        ; --- Initialize test values and counters ---
        MOVLW   b'00111100'
        MOVWF   IN_ADDR
        MOVF    IN_ADDR, W
        MOVWF   TEMP

        CLRF    CUR_CNT
        CLRF    MAX_CNT
        MOVLW   d'8'
        MOVWF   CNT

        ; --- Get first bit as prev_bit ---
        BTFSS   TEMP, 0
        BRA     FIRST_IS_0
        BSF     PREV_BIT, 0
        BRA     LOOP_INIT
FIRST_IS_0:
        BCF     PREV_BIT, 0

LOOP_INIT:
        MOVLW   0x01
        MOVWF   CUR_CNT       ; First bit counts as 1

LOOP:
        ; --- Shift right to get next bit ---
        BCF     STATUS, C
        RRCF    TEMP, F       
        
        DECFSZ  CNT, F
        BRA     CHECK_BIT
        BRA     DONE          ; All 8 bits processed

CHECK_BIT:
        ; --- Compare current bit with prev_bit ---
        BTFSS   STATUS, C
        BRA     BIT_IS_0
BIT_IS_1:
        BTFSC   PREV_BIT, 0   
        BRA     SAME_BIT      
        BSF     PREV_BIT, 0
        MOVLW   0x01
        MOVWF   CUR_CNT       ; Reset counter
        BRA     LOOP
BIT_IS_0:
        BTFSS   PREV_BIT, 0   
        BRA     SAME_BIT      
        BCF     PREV_BIT, 0
        MOVLW   0x01
        MOVWF   CUR_CNT       ; Reset counter
        BRA     LOOP

SAME_BIT:
        ; --- Increment counter and update max ---
        INCF    CUR_CNT, F    
        MOVF    CUR_CNT, W
        CPFSLT  MAX_CNT       
        MOVWF   MAX_CNT       
        BRA     LOOP

DONE:
        MOVF    MAX_CNT, W
        MOVWF   OUT_ADDR
        BRA     DONE
        END`
},
{
  id:"ext-zero-one-diff",
  title:"C4 — Difference Between 0s and 1s",
  category:"C. 迴圈與狀態",
  tags:["BTFSS","RRCF","計數","差值"],
  description:"計算 [0x020] 中 1 的個數與 0 的個數，將 (1的個數 - 0的個數) 存到 [0x021]。",
  testcase:"Testcase 1: [0x020]=0xFF → [0x021]=0x08\nTestcase 2: [0x020]=0x00 → [0x021]=0xF8",
  code:`LIST p=18f4520
#include <p18f4520.inc>

CNT     EQU 0x022
ONES    EQU 0x023

        ORG 0x0000
MAIN:
        ; --- Initialize test value and counters ---
        MOVLW   0x0F
        MOVWF   0x020
        
        MOVF    0x020, W
        MOVWF   0x024
        CLRF    ONES
        MOVLW   d'8'
        MOVWF   CNT

COUNT_LOOP:
        ; --- Count 1s ---
        BTFSS   0x024, 0
        BRA     SKIP
        INCF    ONES, F
SKIP:
        ; --- Shift right ---
        BCF     STATUS, C
        RRCF    0x024, F
        DECFSZ  CNT, F
        BRA     COUNT_LOOP

        ; --- Calculate (1s - 0s) = (2 * 1s) - 8 ---
        MOVF    ONES, W
        BCF     STATUS, C
        RLCF    WREG, W
        ADDLW   0xF8          ; Add -8
        MOVWF   0x021
DONE:
        BRA     DONE
        END`
},
{
  id:"ext-max1-start",
  title:"C5 — Start Index of Longest Consecutive 1s",
  category:"C. 迴圈與狀態",
  tags:["連續1","起始位置","bit index"],
  description:"找出 [0x020] 中，最長連續 1 的「起始 bit index」 (bit 0~7)。\n例如 b'00111100'，最長連續 1 為 bit 2~5，起始位置為 2。",
  testcase:"Testcase 1: [0x020]=b'00111100' → [0x021]=0x02",
  code:`LIST p=18f4520
#include <p18f4520.inc>

IN_ADDR EQU 0x020
OUT_ADDR EQU 0x021
TEMP EQU 0x022
IDX EQU 0x023
MAX_CNT EQU 0x024
CUR_CNT EQU 0x025
MAX_START EQU 0x026
CUR_START EQU 0x027

        ORG 0x0000
MAIN:
        ; --- Initialize test values and counters ---
        MOVLW   b'00111100'
        MOVWF   IN_ADDR
        MOVF    IN_ADDR, W
        MOVWF   TEMP

        CLRF    IDX           
        CLRF    MAX_CNT
        CLRF    CUR_CNT
        CLRF    MAX_START
        CLRF    CUR_START

CHECK_LOOP:
        ; --- Check current bit ---
        BTFSS   TEMP, 0
        BRA     BIT_0
BIT_1:
        MOVF    CUR_CNT, W
        BNZ     CONTINUE_1    ; If length > 0, it's a continuation
        MOVF    IDX, W        ; Start of a new run, record index
        MOVWF   CUR_START
CONTINUE_1:
        ; --- Update current run length and max ---
        INCF    CUR_CNT, F
        MOVF    CUR_CNT, W
        CPFSLT  MAX_CNT       
        BRA     NEXT_BIT
        MOVF    CUR_CNT, W
        MOVWF   MAX_CNT
        MOVF    CUR_START, W
        MOVWF   MAX_START
        BRA     NEXT_BIT

BIT_0:
        ; --- Reset run length ---
        CLRF    CUR_CNT       

NEXT_BIT:
        ; --- Move to next bit ---
        INCF    IDX, F
        BCF     STATUS, C
        RRCF    TEMP, F
        MOVLW   d'8'
        CPFSLT  IDX           ; Check if IDX >= 8
        BRA     DONE
        BRA     CHECK_LOOP

DONE:
        MOVF    MAX_START, W
        MOVWF   OUT_ADDR
        BRA     DONE
        END`
},
{
  id:"ext-c6-fixed-ops",
  title:"C6 — Fixed Count Addition",
  category:"C. 迴圈與狀態",
  tags:["DECFSZ","固定次數","迴圈"],
  description:"將 [0x020] 的值加上 5，共執行 N 次（N 存在 [0x021]）。結果存回 [0x020]。",
  testcase:"Testcase 1: [0x020]=0x01, [0x021]=0x03\n  → 1 + 5 + 5 + 5 = 16 (0x10)",
  code:`LIST p=18f4520
#include <p18f4520.inc>

        ORG 0x0000
MAIN:
        ; --- Initialize test values ---
        MOVLW   0x01
        MOVWF   0x020       
        MOVLW   0x03
        MOVWF   0x021       

        ; --- Setup loop counter ---
        MOVF    0x021, W
        MOVWF   0x022       

        ; --- Skip if N == 0 ---
        MOVF    0x022, W
        BZ      DONE

LOOP:
        ; --- Add 5 and decrement counter ---
        MOVLW   0x05
        ADDWF   0x020, F    
        DECFSZ  0x022, F    
        BRA     LOOP        
DONE:
        BRA     DONE
        END`
},
{
  id:"ext-c7-nested-loop",
  title:"C7 — Nested Loop",
  category:"C. 迴圈與狀態",
  tags:["巢狀迴圈","DECFSZ","外層","內層"],
  description:"使用兩層巢狀迴圈，外層執行 5 次，內層執行 4 次。\n計算總共執行了幾次內層迴圈，結果存到 [0x010] (預期為 5 * 4 = 20)。",
  testcase:"Testcase 1: 執行完畢後 [0x010] = 0x14 (20)",
  code:`LIST p=18f4520
#include <p18f4520.inc>

OUTER_CNT EQU 0x020
INNER_CNT EQU 0x021
TOTAL     EQU 0x010

        ORG 0x0000
MAIN:
        ; --- Initialize outer counter ---
        CLRF    TOTAL
        MOVLW   d'5'
        MOVWF   OUTER_CNT

OUTER_LOOP:
        ; --- Initialize inner counter ---
        MOVLW   d'4'
        MOVWF   INNER_CNT

INNER_LOOP:
        ; --- Increment total and loop inner ---
        INCF    TOTAL, F    
        DECFSZ  INNER_CNT, F
        BRA     INNER_LOOP  

        ; --- Loop outer ---
        DECFSZ  OUTER_CNT, F
        BRA     OUTER_LOOP  
DONE:
        BRA     DONE
        END`
},
{
  id:"ext-c8-flags",
  title:"C8 — Using Z/C/N/OV Flags",
  category:"C. 迴圈與狀態",
  tags:["旗標","無號數","有號數","BNC","BN"],
  description:"不使用 CPFSxx 指令，僅使用 SUBWF 產生的 Z, C, N, OV 旗標，實作無號數比較。\n若 [0x000] > [0x001]，[0x010]=0x11\n相等 → 0x22\n小於 → 0x33",
  testcase:"Testcase 1: 0x05 > 0x02 → [0x010]=0x11",
  code:`LIST p=18f4520
#include <p18f4520.inc>

        ORG 0x0000
MAIN:
        ; --- Initialize test values ---
        MOVLW   0x05
        MOVWF   0x000
        MOVLW   0x02
        MOVWF   0x001

        ; --- Perform subtraction to set flags ---
        MOVF    0x001, W      ; W = B
        SUBWF   0x000, W      ; W = A - B
        BZ      IS_EQUAL      ; Z=1 -> A == B
        
        ; --- Unsigned comparison using Carry (C) ---
        ; If A >= B -> C=1 (no borrow)
        ; If A < B  -> C=0 (borrow)
        BTFSS   STATUS, C
        BRA     A_LESS_B      ; C=0 -> A < B

A_GREATER_B:
        MOVLW   0x11
        MOVWF   0x010
        BRA     DONE

A_LESS_B:
        MOVLW   0x33
        MOVWF   0x010
        BRA     DONE

IS_EQUAL:
        MOVLW   0x22
        MOVWF   0x010
DONE:
        BRA     DONE
        END`
},
{
  id:"ext-signed-compare",
  title:"C9 - 8-bit Signed Comparison",
  category:"C. 迴圈與狀態",
  tags:["signed","比較","旗標"],
  description:"比較 [0x000] 與 [0x001] 兩個 8-bit 有號數。若前者大 → [0x010]=0x11，相等 → 0x22，小 → 0x33。",
  testcase:"Testcase 1: [0x000]=0x05, [0x001]=0xFE (-2) → [0x010]=0x11\nTestcase 2: [0x000]=0xFE, [0x001]=0x05 → [0x010]=0x33",
  code:`LIST p=18f4520
#include <p18f4520.inc>

        ORG 0x0000
MAIN:
        ; --- Initialize test values ---
        MOVLW   0xFE
        MOVWF   0x000
        MOVLW   0x05
        MOVWF   0x001

        ; --- Perform subtraction to set flags ---
        MOVF    0x001, W
        SUBWF   0x000, W
        BZ      IS_EQUAL
        
        ; --- Check for Overflow (OV) and Sign (N) ---
        BTFSS   STATUS, OV
        BRA     NO_OV
        BTFSS   STATUS, N
        BRA     A_LESS
        BRA     A_GREATER
NO_OV:
        BTFSC   STATUS, N
        BRA     A_LESS
        BRA     A_GREATER

IS_EQUAL:
        MOVLW   0x22
        MOVWF   0x010
        BRA     DONE
A_GREATER:
        MOVLW   0x11
        MOVWF   0x010
        BRA     DONE
A_LESS:
        MOVLW   0x33
        MOVWF   0x010
DONE:
        BRA     DONE
        END`
},
{
  id:"ext-c10-wrap",
  title:"C10 - Counter Overflow / Wrap-around",
  category:"C. 迴圈與狀態",
  tags:["溢位","環狀","Z flag","INCF"],
  description:"將 [0x020] 遞增 3 次。若過程中發生溢位（從 0xFF 變成 0x00），則將 [0x021] 設為 0xFF。",
  testcase:"Testcase 1: [0x020]=0xFF，遞增 3 次 → [0x020]=0x02, [0x021]=0xFF",
  code:`LIST p=18f4520
#include <p18f4520.inc>

        ORG 0x0000
MAIN:
        ; --- Initialize test values ---
        MOVLW   0xFF
        MOVWF   0x020
        CLRF    0x021       ; Default: no overflow
        MOVLW   d'3'
        MOVWF   0x022       ; Loop counter

LOOP:
        ; --- Increment value ---
        INCF    0x020, F    
        BNZ     NEXT        ; If result != 0, no overflow
        
        ; --- Overflow occurred (0xFF -> 0x00) ---
        MOVLW   0xFF
        MOVWF   0x021

NEXT:
        DECFSZ  0x022, F
        BRA     LOOP
DONE:
        BRA     DONE
        END`
}
];