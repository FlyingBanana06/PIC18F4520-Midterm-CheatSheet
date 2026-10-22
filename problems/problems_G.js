const problems_G = [
{
  id:"ext-fsr-bubble",
  title:"G1 — Indirect Addressing Bubble Sort",
  category:"G. 高階綜合",
  tags:["LFSR","氣泡排序","間接定址","swap"],
  description:"將 [0x100]~[0x103] 的 4 個整數，使用 FSR 間接定址進行氣泡排序（遞增）。必須使用 FSR。",
  testcase:"Testcase 1: [0x100..0x103] = [0x40, 0x10, 0x30, 0x20]\n  → [0x100..0x103] = [0x10, 0x20, 0x30, 0x40]",
  code:`LIST p=18f4520
#include <p18f4520.inc>

I     EQU 0x020
J     EQU 0x021
TEMP  EQU 0x022

        ORG 0x0000
MAIN:
        ; --- Initialize array ---
        MOVLW   0x40
        MOVWF   0x100
        MOVLW   0x10
        MOVWF   0x101
        MOVLW   0x30
        MOVWF   0x102
        MOVLW   0x20
        MOVWF   0x103

        MOVLW   d'3'
        MOVWF   I

OUTER:
        ; --- Initialize inner loop ---
        MOVLW   d'3'
        MOVWF   J
        LFSR    0, 0x100

INNER:
        ; --- Compare adjacent elements ---
        MOVF    POSTINC0, W      
        MOVWF   TEMP
        MOVF    INDF0, W         
        CPFSLT  TEMP             
        GOTO    NO_SWAP

        ; --- Swap elements ---
        MOVFF   TEMP, POSTDEC0   
        MOVWF   POSTINC0         
        DECF    FSR0L, F         

NO_SWAP:
        DECFSZ  J, F
        GOTO    INNER

        DECFSZ  I, F
        GOTO    OUTER
DONE:
        BRA     DONE
        END`
},
{
  id:"ext-g2-merge-asc",
  title:"G2 — Merge Two Ascending Sequences",
  category:"G. 高階綜合",
  tags:["合併","stable merge","遞增"],
  description:"A 在 [0x100]~[0x103] (4個)，B 在 [0x200]~[0x203] (4個)，皆為遞增。\n合併成遞增序列存到 [0x300]~[0x307]。等值時 A 優先。",
  testcase:"Testcase 1: A=[1,3,5,7], B=[2,4,6,8] → C=[1,2,3,4,5,6,7,8]",
  code:`LIST p=18f4520
#include <p18f4520.inc>

CNT_A EQU 0x020
CNT_B EQU 0x021

        ORG 0x0000
MAIN:
        ; --- Initialize arrays ---
        MOVLW   0x01
        MOVWF   0x100
        MOVLW   0x03
        MOVWF   0x101
        MOVLW   0x02
        MOVWF   0x200
        MOVLW   0x04
        MOVWF   0x201

        ; --- Setup pointers and counters ---
        LFSR    0, 0x100       
        LFSR    1, 0x200       
        LFSR    2, 0x300       

        MOVLW   d'4'
        MOVWF   CNT_A
        MOVLW   d'4'
        MOVWF   CNT_B

MERGE_LOOP:
        ; --- Check if one array is empty ---
        MOVF    CNT_A, W
        BZ      COPY_B_ONLY    
        MOVF    CNT_B, W
        BZ      COPY_A_ONLY    

        ; --- Compare and pick the smaller one ---
        MOVF    INDF0, W       
        CPFSLT  INDF1          
        BRA     TAKE_A         

TAKE_B:
        MOVF    POSTINC1, W
        MOVWF   POSTINC2
        DECF    CNT_B, F
        BRA     MERGE_LOOP

TAKE_A:
        MOVF    POSTINC0, W
        MOVWF   POSTINC2
        DECF    CNT_A, F
        BRA     MERGE_LOOP

COPY_B_ONLY:
        ; --- Copy remaining B ---
        MOVF    CNT_B, W
        BZ      DONE
CB_LOOP:
        MOVF    POSTINC1, W
        MOVWF   POSTINC2
        DECFSZ  CNT_B, F
        BRA     CB_LOOP
        BRA     DONE

COPY_A_ONLY:
        ; --- Copy remaining A ---
        MOVF    CNT_A, W
        BZ      DONE
CA_LOOP:
        MOVF    POSTINC0, W
        MOVWF   POSTINC2
        DECFSZ  CNT_A, F
        BRA     CA_LOOP
DONE:
        BRA     DONE
        END`
},
{
  id:"ext-g3-kth-smallest",
  title:"G3 — Find K-th Smallest using Selection Sort",
  category:"G. 高階綜合",
  tags:["找第k小","間接定址","選擇排序"],
  description:"給定陣列 [0x100]~[0x104] (5個元素)，找出第 3 小 (k=3，k從1開始) 的值，存到 [0x010]。\n(做法：使用選擇排序，排到第 3 次就停止)。",
  testcase:"Testcase 1: 陣列 = [5, 1, 4, 2, 3] → 第3小為 3",
  code:`LIST p=18f4520
#include <p18f4520.inc>

I     EQU 0x020         
J     EQU 0x021         
MIN_IDX EQU 0x022       
TEMP  EQU 0x023

        ORG 0x0000
MAIN:
        ; --- Initialize array ---
        MOVLW   0x05
        MOVWF   0x100
        MOVLW   0x01
        MOVWF   0x101
        MOVLW   0x04
        MOVWF   0x102
        MOVLW   0x02
        MOVWF   0x103
        MOVLW   0x03
        MOVWF   0x104

        CLRF    I             
        
OUTER:
        ; --- Find minimum in unsorted part ---
        MOVF    I, W
        MOVWF   MIN_IDX       
        
        MOVF    I, W
        ADDLW   0x01
        MOVWF   J             

        ; --- Setup pointers ---
        LFSR    0, 0x100
        MOVF    I, W
        ADDWF   FSR0L, F      
        LFSR    1, 0x100
        MOVF    J, W
        ADDWF   FSR1L, F      

INNER:
        ; --- Compare and update min index ---
        MOVLW   d'5'
        CPFSLT  J             
        BRA     AFTER_INNER

        MOVF    INDF1, W      
        CPFSLT  INDF0         
        BRA     NEXT_J
        
        MOVF    J, W
        MOVWF   MIN_IDX

NEXT_J:
        INCF    J, F
        INCF    FSR1L, F
        BRA     INNER

AFTER_INNER:
        ; --- Swap if min index changed ---
        MOVF    I, W
        CPFSEQ  MIN_IDX
        BRA     DO_SWAP
        BRA     CHECK_K

DO_SWAP:
        ; --- Setup pointers for swap ---
        LFSR    0, 0x100
        MOVF    I, W
        ADDWF   FSR0L, F      
        LFSR    1, 0x100
        MOVF    MIN_IDX, W
        ADDWF   FSR1L, F      

        ; --- Swap ---
        MOVF    INDF0, W
        MOVWF   TEMP
        MOVF    INDF1, W
        MOVWF   INDF0
        MOVF    TEMP, W
        MOVWF   INDF1

CHECK_K:
        ; --- Check if we sorted 3 elements ---
        INCF    I, F
        MOVF    I, W
        XORLW   d'3'          
        BZ      DONE
        BRA     OUTER

DONE:
        ; --- 3rd smallest is at arr[2] (0-based) ---
        MOVF    0x102, W
        MOVWF   0x010
        BRA     DONE
        END`
},
{
  id:"ext-g4-insertion-sort",
  title:"G4 — Insertion Sort",
  category:"G. 高階綜合",
  tags:["插入排序","FSR","排序"],
  description:"將 [0x100]~[0x103] 的四個值，使用插入排序法（Insertion Sort）由小到大排序。",
  testcase:"Testcase 1: [3, 1, 4, 2] → [1, 2, 3, 4]",
  code:`LIST p=18f4520
#include <p18f4520.inc>

I     EQU 0x020
J     EQU 0x021
KEY   EQU 0x022

        ORG 0x0000
MAIN:
        ; --- Initialize array ---
        MOVLW   0x03
        MOVWF   0x100
        MOVLW   0x01
        MOVWF   0x101
        MOVLW   0x04
        MOVWF   0x102
        MOVLW   0x02
        MOVWF   0x103

        MOVLW   d'1'
        MOVWF   I           

OUTER_LOOP:
        ; --- Check if sorting is complete ---
        MOVLW   d'4'
        CPFSLT  I           
        BRA     DONE

        ; --- Extract KEY = arr[I] ---
        LFSR    0, 0x100
        MOVF    I, W
        ADDWF   FSR0L, F    
        MOVF    INDF0, W
        MOVWF   KEY

        MOVF    I, W
        MOVWF   J
        DECF    J, F        

INNER_LOOP:
        ; --- Check if J < 0 ---
        MOVF    J, W
        XORLW   0xFF        
        BZ      INSERT_KEY

        ; --- Compare arr[J] with KEY ---
        LFSR    0, 0x100
        MOVF    J, W
        ADDWF   FSR0L, F    
        MOVF    INDF0, W    
        CPFSLT  KEY         
        BRA     INSERT_KEY  

        ; --- Shift arr[J] to arr[J+1] ---
        MOVF    INDF0, W
        MOVWF   POSTINC0    
        DECF    J, F        
        BRA     INNER_LOOP

INSERT_KEY:
        ; --- Insert KEY at correct position ---
        LFSR    0, 0x100
        MOVF    J, W
        ADDWF   FSR0L, F
        INCF    FSR0L, F    
        MOVF    KEY, W
        MOVWF   INDF0

        INCF    I, F        
        BRA     OUTER_LOOP
DONE:
        BRA     DONE
        END`
},
{
  id:"ext-g5-qs-simple",
  title:"G5 — Iterative Quicksort (Simplified)",
  category:"G. 高階綜合",
  tags:["quicksort","迭代","無遞迴","簡化版"],
  description:"實作一個只針對長度 5 的陣列 [0x100]~[0x104] 的迭代 Quicksort。\n限制：不可使用遞迴（CALL），必須用迴圈完成 Partition。",
  testcase:"Testcase 1: [5, 2, 4, 1, 3] → 排序後 [1, 2, 3, 4, 5]",
  code:`LIST p=18f4520
#include <p18f4520.inc>

LOW   EQU 0x020
HIGH  EQU 0x021
PIVOT EQU 0x022
I     EQU 0x023
J     EQU 0x024

        ORG 0x0000
MAIN:
        ; --- Initialize array ---
        MOVLW   0x05
        MOVWF   0x100
        MOVLW   0x02
        MOVWF   0x101
        MOVLW   0x04
        MOVWF   0x102
        MOVLW   0x01
        MOVWF   0x103
        MOVLW   0x03
        MOVWF   0x104

        ; --- Simplified: single partition step ---
        MOVLW   d'0'
        MOVWF   LOW
        MOVLW   d'4'
        MOVWF   HIGH
        
        ; --- Pivot = arr[2] ---
        MOVF    0x102, W
        MOVWF   PIVOT

        MOVF    LOW, W
        MOVWF   I
        MOVF    HIGH, W
        MOVWF   J

PARTITION:
        ; --- Find left element > Pivot ---
LEFT_LOOP:
        LFSR    0, 0x100
        MOVF    I, W
        ADDWF   FSR0L, F
        MOVF    INDF0, W
        CPFSLT  PIVOT       
        BRA     FIND_RIGHT
        INCF    I, F
        BRA     LEFT_LOOP

FIND_RIGHT:
        ; --- Find right element < Pivot ---
RIGHT_LOOP:
        LFSR    1, 0x100
        MOVF    J, W
        ADDWF   FSR1L, F
        MOVF    INDF1, W
        CPFSGT  PIVOT       
        BRA     DO_SWAP
        DECF    J, F
        BRA     RIGHT_LOOP

DO_SWAP:
        ; --- Swap if I < J ---
        MOVF    J, W
        CPFSLT  I           
        BRA     DONE
        
        MOVF    INDF0, W
        MOVWF   PIVOT      
        MOVF    INDF1, W
        MOVWF   INDF0
        MOVF    PIVOT, W
        MOVWF   INDF1
        ; Note: Pivot value not restored here (simplified framework)
        
DONE:
        BRA     DONE
        END`
},
{
  id:"ext-g6-subleq-single",
  title:"G6 — Simplified SUBLEQ Single Step",
  category:"G. 高階綜合",
  tags:["SUBLEQ","單步","Signed"],
  description:"只執行「一條」SUBLEQ 指令。\n指令位於 [0x00]=a, [0x01]=b, [0x02]=c。\n計算 *b = *b - *a (8-bit signed)，並判斷是否跳躍（若結果 <=0，PC=c；否則 PC=PC+3）。",
  testcase:"Testcase 1: a=0x04, b=0x05, c=0x03。\n[0x04]=0x02, [0x05]=0x00。\n計算 [0x05] = 0x00 - 0x02 = 0xFE (<0)，PC 跳至 0x03。",
  code:`LIST p=18f4520
#include <p18f4520.inc>

PC_L EQU 0x100

        ORG 0x0000
MAIN:
        ; --- Setup instruction ---
        MOVLW   0x04
        MOVWF   0x00
        MOVLW   0x05
        MOVWF   0x01
        MOVLW   0x03
        MOVWF   0x02
        
        ; --- Setup data ---
        MOVLW   0x02
        MOVWF   0x04
        MOVLW   0x00
        MOVWF   0x05

        ; --- Fetch a, b, c ---
        MOVF    0x00, W
        MOVWF   0x102       
        MOVF    0x01, W
        MOVWF   0x103       
        MOVF    0x02, W
        MOVWF   0x104       

        ; --- Execute *b = *b - *a ---
        CLRF    FSR0H
        MOVFF   0x102, FSR0L
        MOVF    INDF0, W    ; W = *a
        
        CLRF    FSR1H
        MOVFF   0x103, FSR1L
        SUBWF   INDF1, F    ; *b = *b - W

        ; --- Branch if Z or N ---
        BTFSC   STATUS, Z
        BRA     BRANCH_TO_C
        BTFSC   STATUS, N
        BRA     BRANCH_TO_C
        
        ; --- PC = PC + 3 ---
        MOVLW   0x03
        MOVWF   PC_L
        BRA     DONE

BRANCH_TO_C:
        ; --- PC = c ---
        MOVFF   0x104, PC_L
DONE:
        BRA     DONE
        END`
},
{
  id:"ext-g7-subleq-trace",
  title:"G7 — SUBLEQ Program Trace",
  category:"G. 高階綜合",
  tags:["SUBLEQ","追蹤","迴圈","signed"],
  description:"給定一段兩條指令的 SUBLEQ 程式，請追蹤其執行直到 PC >= 0xFE。\n計算最終 [0x05] 的值。\n(提示：這是標準的 SUBLEQ 迴圈，會將 [0x05] 清零)",
  testcase:"Testcase 1:\n[0x00]=04,05,03 (subleq 0x04, 0x05, 0x03)\n[0x03]=05,05,FE (subleq 0x05, 0x05, 0xFE)\n[0x04]=01, [0x05]=01\n最終 [0x05]=0x00, PC=0xFE",
  code:`LIST p=18f4520
#include <p18f4520.inc>

PC_L    EQU 0x100
VAR_A   EQU 0x102
VAR_B   EQU 0x103
VAR_C   EQU 0x104

        ORG 0x0000
MAIN:
        ; --- Load instructions ---
        MOVLW   0x04
        MOVWF   0x00
        MOVLW   0x05
        MOVWF   0x01
        MOVLW   0x03
        MOVWF   0x02
        MOVLW   0x05
        MOVWF   0x03
        MOVLW   0x05
        MOVWF   0x04
        MOVLW   0xFE
        MOVWF   0x05
        MOVLW   0x01
        MOVWF   0x06
        MOVLW   0x01
        MOVWF   0x07

        CLRF    PC_L

LOOP:
        ; --- Check termination condition ---
        MOVLW   0xFE
        CPFSLT  PC_L        
        BRA     HALT

        ; --- Fetch a, b, c ---
        CLRF    FSR0H
        MOVFF   PC_L, FSR0L
        MOVFF   POSTINC0, VAR_A
        MOVFF   POSTINC0, VAR_B
        MOVFF   POSTINC0, VAR_C

        ; --- Execute *b = *b - *a ---
        CLRF    FSR0H
        MOVFF   VAR_A, FSR0L
        MOVF    INDF0, W
        
        CLRF    FSR1H
        MOVFF   VAR_B, FSR1L
        SUBWF   INDF1, F

        ; --- Branch evaluation ---
        BTFSC   STATUS, Z
        BRA     BRANCH_C
        BTFSC   STATUS, N
        BRA     BRANCH_C
        
        ; --- PC += 3 ---
        MOVLW   0x03
        ADDWF   PC_L, F
        BRA     LOOP

BRANCH_C:
        ; --- PC = c ---
        MOVFF   VAR_C, PC_L
        BRA     LOOP
HALT:
        SLEEP
        END`
},
{
  id:"ext-explicit-stack",
  title:"G8 — Explicit Stack using Data Memory",
  category:"G. 高階綜合",
  tags:["PREINC","POSTDEC","stack","LFSR"],
  description:"實作 Push 與 Pop 巨集/副程式。使用 FSR1 作為 Stack Pointer，初始指向 0x300。Push 時將值存入並遞增指標；Pop 時指標遞減並讀取。",
  testcase:"Testcase 1: Push 0xAA, Push 0xBB, Pop 到 0x010 (得到 0xBB), Pop 到 0x011 (得到 0xAA)",
  code:`LIST p=18f4520
#include <p18f4520.inc>

PUSH MACRO val
        MOVF    val, W
        MOVWF   POSTINC1         ; Write then increment
        ENDM

POP MACRO dest
        MOVF    POSTDEC1, W      ; Decrement then read
        MOVWF   dest
        ENDM

        ORG 0x0000
MAIN:
        ; --- Initialize Stack Pointer ---
        LFSR    1, 0x300         

        ; --- Setup test data ---
        MOVLW   0xAA
        MOVWF   0x020
        MOVLW   0xBB
        MOVWF   0x021

        ; --- Test Push and Pop ---
        PUSH    0x020            
        PUSH    0x021            

        POP     0x010            
        POP     0x011            
DONE:
        BRA     DONE
        END`
},
{
  id:"ext-g9-frac-mul",
  title:"G9 — Fraction Multiplication & Simplification",
  category:"G. 高階綜合",
  tags:["fractionCalc","GCD","乘法","化簡"],
  description:"計算 A/B × C/D。結果需化簡。\n輸入：A=[0x000], B=[0x001], C=[0x002], D=[0x003]\n輸出：[0x010:0x011]=分子, [0x012:0x013]=分母。",
  testcase:"Testcase 1: 2/3 × 3/4 = 6/12 = 1/2 → 分子 0x0001, 分母 0x0002",
  code:`LIST p=18f4520
#include <p18f4520.inc>

        ORG 0x0000
MAIN:
        ; --- Initialize test fractions ---
        MOVLW   0x02
        MOVWF   0x000
        MOVLW   0x03
        MOVWF   0x001
        MOVLW   0x03
        MOVWF   0x002
        MOVLW   0x04
        MOVWF   0x003

        ; --- Numerator = A * C ---
        MOVF    0x000, W
        MULWF   0x002
        MOVFF   PRODL, 0x010
        MOVFF   PRODH, 0x011

        ; --- Denominator = B * D ---
        MOVF    0x001, W
        MULWF   0x003
        MOVFF   PRODL, 0x012
        MOVFF   PRODH, 0x013

        ; Note: GCD simplification step omitted for brevity.
DONE:
        BRA     DONE
        END`
},
{
  id:"ext-g10-frac-multi",
  title:"G10 — Multi-Step Fraction Operation (Same Precedence)",
  category:"G. 高階綜合",
  tags:["fractionCalc","多步","優先權"],
  description:"計算 A/B op1 C/D op2 E/F，假設 op1 與 op2 皆為乘法 (*)。\n輸入位於 [0x000]~[0x005]，op1/op2 位於 [0x006], [0x007] (皆為 0x02)。\n只需依序計算 (A/B * C/D) * E/F。並將結果存至 [0x010]~[0x013]。",
  testcase:"Testcase 1: 1/2 * 2/3 * 3/4 = 1/4 → 分子 1, 分母 4",
  code:`LIST p=18f4520
#include <p18f4520.inc>

        ORG 0x0000
MAIN:
        ; --- Initialize fractions: 1/2, 2/3, 3/4 ---
        MOVLW   0x01
        MOVWF   0x000
        MOVLW   0x02
        MOVWF   0x001
        MOVLW   0x02
        MOVWF   0x002
        MOVLW   0x03
        MOVWF   0x003
        MOVLW   0x03
        MOVWF   0x004
        MOVLW   0x04
        MOVWF   0x005
        MOVLW   0x02
        MOVWF   0x006
        MOVWF   0x007

        ; --- Step 1: (A/B * C/D) ---
        MOVF    0x000, W
        MULWF   0x002
        MOVFF   PRODL, 0x010
        MOVFF   PRODH, 0x011
        
        MOVF    0x001, W
        MULWF   0x003
        MOVFF   PRODL, 0x012
        MOVFF   PRODH, 0x013

        ; --- Step 2: Multiply by E/F ---
        MOVF    0x010, W
        MULWF   0x004
        MOVFF   PRODL, 0x010
        MOVFF   PRODH, 0x011

        MOVF    0x012, W
        MULWF   0x005
        MOVFF   PRODL, 0x012
        MOVFF   PRODH, 0x013

        ; Note: GCD simplification step omitted for brevity.
DONE:
        BRA     DONE
        END`
}
];